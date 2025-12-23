const express = require('express');
const router = express.Router();
const LabBooking = require('../models/LabBooking');
const Project = require('../models/project');
const protect = require('../middleware/authmiddleware');
const sendEmail = require('../utils/sendEmail');
const { getLabBookingTemplate } = require('../utils/emailTemplates'); // 🟢 Import Template

// ... (GET Routes remain same) ...
router.get('/my-bookings', protect, async(req, res) => {
    try {
        const bookings = await LabBooking.find({ student: req.user.id })
            .populate('project', 'title').sort({ createdAt: -1 });
        res.json(bookings);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/all', protect, async(req, res) => {
    try {
        const bookings = await LabBooking.find()
            .populate('student', 'name email enrollmentNo').populate('project', 'title').sort({ createdAt: -1 });
        res.json(bookings);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 🟢 UPDATED BOOKING ROUTE
router.post('/book', protect, async(req, res) => {
    try {
        const { labName, facultyEmail, date, timeSlot, reason, email, projectId } = req.body;

        if (!projectId) return res.status(400).json({ message: "Please select a project." });

        const existing = await LabBooking.findOne({ labName, date, timeSlot, status: 'Approved' });
        if (existing) return res.status(400).json({ message: "Slot already booked!" });

        const newBooking = new LabBooking({
            labName,
            facultyEmail,
            date,
            timeSlot,
            reason,
            project: projectId,
            student: req.user.id,
            confirmationEmail: email,
            status: 'Pending'
        });

        await newBooking.save();

        // Fetch Full Data for Email
        const fullData = await LabBooking.findById(newBooking._id)
            .populate('student', 'name email enrollmentNo department')
            .populate('project', 'title');

        const { student, project } = fullData;

        // 🟢 SEND PROFESSIONAL EMAIL TO FACULTY
        if (facultyEmail) {
            try {
                await sendEmail({
                    to: facultyEmail,
                    replyTo: student.email, // 🟢 Faculty replies directly to Student
                    subject: `📢 Lab Request: ${student.name} - ${labName}`,
                    html: getLabBookingTemplate(student, project, newBooking) // 🟢 Use Beautiful Template
                });
                console.log("✅ Professional Email Sent to Faculty");
            } catch (e) {
                console.error("Email Error:", e.message);
            }
        }

        // Email to Student (Simple confirmation)
        if (email) {
            try {
                await sendEmail({
                    to: email,
                    subject: "⏳ Request Sent Successfully",
                    html: `<p>Dear ${student.name}, your request for <strong>${labName}</strong> is sent to the faculty.</p>`
                });
            } catch (e) {}
        }

        res.status(201).json({ message: "Booking Requested" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ... (Approve/Delete routes remain same) ...
router.put('/approve/:id', protect, async(req, res) => {
    // Keep your existing safe-mode approve logic here
    // ...
});

router.post('/delete-batch', protect, async(req, res) => {
    const { ids } = req.body;
    await LabBooking.deleteMany({ _id: { $in: ids }, student: req.user.id, status: 'Pending' });
    res.json({ message: "Deleted" });
});

module.exports = router;