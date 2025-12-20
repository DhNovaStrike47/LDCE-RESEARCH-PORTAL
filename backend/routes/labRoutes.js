const express = require('express');
const router = express.Router();
const LabBooking = require('../models/LabBooking');
const protect = require('../middleware/authmiddleware');
const sendEmail = require('../utils/sendEmail');

// 1. GET MY BOOKINGS (This was missing!)
// Only returns bookings made by the logged-in student
router.get('/my-bookings', protect, async(req, res) => {
    try {
        const bookings = await LabBooking.find({ student: req.user.id }).sort({ createdAt: -1 });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. BOOK A LAB & SEND EMAIL
router.post('/book', protect, async(req, res) => {
    try {
        const { labName, date, timeSlot, reason, email } = req.body;

        // Check for duplicates
        const existing = await LabBooking.findOne({ labName, date, timeSlot, status: 'Approved' });
        if (existing) {
            return res.status(400).json({ message: "Slot already booked!" });
        }

        // Save Booking
        const newBooking = new LabBooking({
            labName,
            date,
            timeSlot,
            reason,
            student: req.user.id
        });

        await newBooking.save();

        // Send Email (Safe Mode)
        try {
            const message = `
                <h3>Lab Booking Confirmed</h3>
                <p><strong>Lab:</strong> ${labName}</p>
                <p><strong>Date:</strong> ${date}</p>
                <p><strong>Time:</strong> ${timeSlot}</p>
                <p>Status: Pending Approval</p>
            `;

            if (email) {
                await sendEmail({
                    to: email,
                    subject: "✅ Booking Received - LDCE Portal",
                    html: message
                });
                console.log(`✅ Email sent to ${email}`);
            }
        } catch (emailError) {
            console.error("⚠️ Email Failed:", emailError.message);
        }

        res.status(201).json({ message: "Lab Booking Requested!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. GET ALL BOOKINGS (For Faculty Dashboard - Future Use)
router.get('/all', protect, async(req, res) => {
    try {
        const bookings = await LabBooking.find().populate('student', 'name email');
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. APPROVE/REJECT LAB BOOKING & SEND EMAIL
router.put('/approve/:id', protect, async(req, res) => {
    try {
        const { status } = req.body; // status will be "Approved" or "Rejected"

        // 1. Find the booking and get Student details (Name & Email)
        const booking = await LabBooking.findById(req.params.id).populate('student', 'name email');

        if (!booking) return res.status(404).json({ message: "Booking not found" });

        // 2. Update Status
        booking.status = status;
        await booking.save();

        // 3. Send Email Notification
        try {
            const subject = status === 'Approved' ? "✅ Lab Booking Confirmed!" : "❌ Lab Booking Rejected";
            const color = status === 'Approved' ? "#16a34a" : "#dc2626"; // Green or Red

            const message = `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                    <h2 style="color: ${color};">${subject}</h2>
                    <p>Dear ${booking.student.name},</p>
                    <p>Your request has been <strong>${status}</strong> by the Faculty.</p>
                    
                    <div style="background-color: #f9fafb; padding: 15px; margin: 15px 0; border-radius: 5px;">
                        <p><strong>Lab:</strong> ${booking.labName}</p>
                        <p><strong>Date:</strong> ${booking.date}</p>
                        <p><strong>Time:</strong> ${booking.timeSlot}</p>
                    </div>

                    <p>Please login to the portal to view more details.</p>
                    <br/>
                    <p style="font-size: 12px; color: gray;">LDCE Research Portal Automated System</p>
                </div>
            `;

            // Send to the student's registered email
            await sendEmail({
                to: booking.student.email,
                subject: subject,
                html: message
            });

            console.log(`✅ Notification email sent to ${booking.student.email}`);

        } catch (emailError) {
            console.error("⚠️ Email Notification Failed:", emailError.message);
        }

        res.json({ message: `Booking ${status} & Email Sent!`, booking });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. WITHDRAW/DELETE BOOKING (Student Only)
router.delete('/delete/:id', protect, async(req, res) => {
    try {
        const booking = await LabBooking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        // Security Check: Ensure the student owns this booking
        if (booking.student.toString() !== req.user.id) {
            return res.status(401).json({ message: "Not authorized to delete this" });
        }

        // Logic Check: Can only withdraw 'Pending' requests
        if (booking.status !== 'Pending') {
            return res.status(400).json({ message: "Cannot withdraw processed requests. Contact Faculty." });
        }

        await LabBooking.findByIdAndDelete(req.params.id);
        res.json({ message: "Booking Request Withdrawn" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// 6. BATCH WITHDRAW (Delete Multiple)
router.post('/delete-batch', protect, async(req, res) => {
    try {
        const { ids } = req.body; // We expect an array: ["id1", "id2"]

        if (!ids || ids.length === 0) {
            return res.status(400).json({ message: "No items selected" });
        }

        // Delete ONLY if:
        // 1. The ID is in the list
        // 2. The booking belongs to the logged-in student
        // 3. The status is 'Pending' (Cannot delete Approved ones)
        const result = await LabBooking.deleteMany({
            _id: { $in: ids },
            student: req.user.id,
            status: 'Pending'
        });

        if (result.deletedCount === 0) {
            return res.status(400).json({ message: "Could not delete. Check if requests are Pending." });
        }

        res.json({ message: `Successfully withdrawn ${result.deletedCount} requests.` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;