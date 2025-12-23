const express = require('express');
const router = express.Router();
const Collaboration = require('../models/Collaboration');
const nodemailer = require('nodemailer');

// 🟢 FIX: Import the protect middleware (Ensure the path to your middleware is correct)
const protect = require('../middleware/authmiddleware');

// Updated Transporter in collaboration.js
const transporter = nodemailer.createTransport({
    service: 'gmail', // 🟢 Use 'service' instead of host/port
    auth: {
        user: 'dhanvi8686@gmail.com',
        pass: 'dlfa ujes wyqz plka'
    }
});

// 1. SEND COLLABORATION REQUEST (Preserved Feature)
router.post('/request', async(req, res) => {
            try {
                const {
                    senderId,
                    receiverEmail,
                    senderName,
                    senderEmail,
                    senderRole,
                    senderDepartment,
                    senderEnrollment,
                    senderDesignation,
                    projectTitle,
                    domain,
                    projectGithub,
                    researchPaperLink,
                    message
                } = req.body;

                const newCollab = new Collaboration({
                    sender: senderId,
                    receiverEmail,
                    senderName,
                    senderEmail,
                    senderRole,
                    senderDepartment,
                    senderEnrollment,
                    senderDesignation,
                    projectTitle,
                    domain,
                    projectGithub,
                    researchPaperLink,
                    message
                });

                await newCollab.save();

                const mailOptions = {
                        from: '"LDCE Research Portal" <no-reply@ldce.ac.in>',
                        to: receiverEmail,
                        subject: `🚀 Collaboration Request: ${projectTitle}`,
                        html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                    <h2 style="color: #1e3a8a;">New Collaboration Request</h2>
                    <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                        <h3 style="margin-top: 0; color: #0369a1;">👤 Applicant Details</h3>
                        <p><strong>Name:</strong> ${senderName}</p>
                        <p><strong>Role:</strong> ${senderRole}</p>
                        ${senderDepartment ? `<p><strong>Dept:</strong> ${senderDepartment}</p>` : ''}
                        ${senderEnrollment ? `<p><strong>Enrollment:</strong> ${senderEnrollment}</p>` : ''}
                        ${senderDesignation ? `<p><strong>Designation:</strong> ${senderDesignation}</p>` : ''}
                    </div>
                    <div style="margin-bottom: 20px;">
                         <h3 style="color: #0369a1;">📂 Target Project</h3>
                         <p><strong>Title:</strong> ${projectTitle}</p>
                         <p><strong>Domain:</strong> ${domain}</p>
                    </div>
                    <p><strong>🔗 Applicant's Work:</strong> <a href="${researchPaperLink}">View Profile/Paper</a></p>
                    <p><strong>💬 Message:</strong> "${message}"</p>
                    <hr />
                    <p>Please log in to the portal to <strong>Approve</strong> or <strong>Reject</strong>.</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        res.json({ message: "Request Sent & Data Saved!" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to send request" });
    }
});

// 2. FETCH MY REQUESTS (Preserved Feature)
router.get('/my-requests/:email', protect, async (req, res) => {
    try {
        // 🟢 Strategy: Fetch if the user is EITHER the sender OR the receiver
        const requests = await Collaboration.find({
            $or: [
                { senderEmail: req.params.email },
                { receiverEmail: req.params.email }
            ]
        }).sort({ createdAt: -1 });
        
        res.json(requests);
    } catch (err) {
        res.status(500).json({ error: "Database fetch failed" });
    }
});

// 3. APPROVE REQUEST (Preserved Feature)
router.put('/approve/:id', async (req, res) => {
    try {
        const collab = await Collaboration.findById(req.params.id);
        if(!collab) return res.status(404).json({ error: "Not Found" });

        collab.status = 'Approved';
        await collab.save();
        
        const mailOptions = {
            from: '"LDCE Research Portal" <no-reply@ldce.ac.in>',
            to: collab.senderEmail,
            subject: `✅ Collaboration Approved!`,
            html: `<p>Your request for <strong>${collab.projectTitle}</strong> has been accepted!</p>`
        };
        await transporter.sendMail(mailOptions);

        res.json({ message: "Approved!" });
    } catch (err) {
        res.status(500).json({ error: "Update Failed" });
    }
});


// --- NEW: SEND OFFICIAL DIRECTIVE ROUTE ---
router.post('/send-directive', protect, async (req, res) => {
    try {
        const { studentEmail, studentName, projectTitle, directive } = req.body;
        const facultyName = req.user.name; // From protect middleware

        const mailOptions = {
            from: `"LDCE Research Portal" <${process.env.EMAIL_USER}>`,
            to: studentEmail,
            subject: `📝 Official Research Directive: ${projectTitle}`,
            html: `
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; border: 2px solid #0f172a; border-radius: 16px; overflow: hidden;">
                    <div style="background: #0f172a; color: white; padding: 30px; text-align: center;">
                        <h2 style="margin: 0; letter-spacing: 1px;">OFFICIAL DIRECTIVE</h2>
                        <p style="opacity: 0.8; margin-top: 5px;">Academic Year 2025-26</p>
                    </div>
                    <div style="padding: 40px; color: #1e293b; line-height: 1.6;">
                        <p>Dear <b>${studentName}</b>,</p>
                        <p>As part of your approved collaboration on the project <b>"${projectTitle}"</b>, Professor <b>${facultyName}</b> has issued the following official directive:</p>
                        
                        <div style="background: #f8fafc; border-left: 5px solid #0f172a; padding: 20px; margin: 25px 0; font-style: italic; border-radius: 4px;">
                            "${directive}"
                        </div>

                        <p>Please acknowledge this directive by replying to this email or through the research portal workspace.</p>
                        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
                        <p style="font-size: 12px; color: #64748b; text-align: center;">This is an official communication from the LDCE Research Portal.</p>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: "Official directive dispatched." });
    } catch (err) {
        console.error("Directive Error:", err);
        res.status(500).json({ error: "Failed to send official directive." });
    }
});

// 4. PROFESSIONAL MAIL (Fixed and Merged)
// backend/routes/collaboration.js

// backend/routes/collaboration.js

router.post('/send-professional-mail', protect, async (req, res) => {
    try {
        const data = req.body;

        // 1. Save the Collaboration to the Database for Portal Tracking
        const newCollab = new Collaboration({
           sender: data.senderId,
            receiverEmail: data.facultyEmail,
            senderName: data.studentName,
            senderEmail: data.studentEmail,
            senderRole: data.studentRole,
            senderDepartment: data.studentDepartment,
            senderEnrollment: data.studentEnrollment,
            senderLinkedIn: data.studentLinkedIn,
            senderAchievements: data.studentAchievements,
            projectTitle: data.facultyProjectTitle,
            domain: data.domain,
            projectGithub: data.githubLink,
            researchPaperLink: data.researchPaper || "Not Provided",
            projectDescription: data.description,
            message: data.message,
            status: 'Pending'
        });
        await newCollab.save();

        // 2. Email to Faculty (The "Humble Professional" Dossier)
        const facultyMailOptions = {
            from: `"LDCE Research Portal" <${process.env.EMAIL_USER}>`,
            to: data.facultyEmail,
            subject: `🚀 Formal Research Inquiry: ${data.studentName} (${data.studentEnrollment})`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                    <div style="background: #1e3a8a; color: white; padding: 25px; text-align: center;">
                        <h2 style="margin: 0;">Collaboration Proposal</h2>
                    </div>
                    <div style="padding: 30px; color: #334155;">
                        <p>Dear Professor,</p>
                        <p>I am writing to formally propose a research collaboration regarding your project: <strong>"${data.facultyProjectTitle}"</strong>.</p>
                        
                        <div style="background: #f8fafc; padding: 20px; border-left: 4px solid #1e3a8a; margin: 20px 0;">
                            <h4 style="margin-top: 0; color: #1e3a8a;">Student Credentials:</h4>
                            <p style="margin: 5px 0;"><b>Name:</b> ${data.studentName}</p>
                            <p style="margin: 5px 0;"><b>Enrollment:</b> ${data.studentEnrollment}</p>
                            <p style="margin: 5px 0;"><b>Department:</b> ${data.studentDepartment}</p>
                            <p style="margin: 5px 0;"><b>Achievements:</b> ${data.studentAchievements}</p>
                        </div>

                        <div style="background: #eff6ff; padding: 20px; border-radius: 8px;">
                            <h4 style="margin-top: 0; color: #2563eb;">Linked Research Work:</h4>
                            <p style="margin: 5px 0;"><b>Project Title:</b> ${data.studentProjectTitle}</p>
                            <p style="margin: 5px 0;"><b>Domain/Type:</b> ${data.domain} (${data.projectType})</p>
                            <p style="margin: 5px 0;"><b>GitHub:</b> <a href="${data.githubLink}">${data.githubLink}</a></p>
                        </div>

                        <p style="margin-top: 25px;"><b>Personal Note:</b><br/><em>"${data.message}"</em></p>
                    </div>
                    <div style="background: #f1f5f9; padding: 15px; text-align: center; font-size: 12px;">
                        <p>Login to the portal to approve this request.</p>
                    </div>
                </div>
            `
        };

        // 3. Email to Student (The Awareness/Confirmation Receipt)
        const studentMailOptions = {
            from: `"LDCE Research Portal" <${process.env.EMAIL_USER}>`,
            to: data.studentEmail,
            subject: `✅ Confirmation: Proposal Sent to ${data.facultyName}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; border: 1px solid #dcfce7; border-radius: 12px;">
                    <div style="background: #10b981; color: white; padding: 20px; text-align: center;">
                        <h2 style="margin: 0;">Proposal Dispatched</h2>
                    </div>
                    <div style="padding: 25px; color: #1f2937;">
                        <p>Hello ${data.studentName},</p>
                        <p>This is a confirmation that your collaboration request has been successfully sent to:</p>
                        <ul style="list-style: none; padding: 0;">
                            <li><strong>Faculty:</strong> ${data.facultyName}</li>
                            <li><strong>Email:</strong> ${data.facultyEmail}</li>
                            <li><strong>Project:</strong> ${data.facultyProjectTitle}</li>
                        </ul>
                        <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
                        <p>The faculty will review your credentials and linked project (<b>${data.studentProjectTitle}</b>). You will be notified of their decision shortly.</p>
                    </div>
                </div>
            `
        };

        // 🟢 Fire-and-Forget: Execute both emails simultaneously
        await Promise.all([
            transporter.sendMail(facultyMailOptions),
            transporter.sendMail(studentMailOptions)
        ]);

        res.status(200).json({ message: "Dual-notification dispatched successfully." });

    } catch (err) {
        console.error("System Error:", err);
        res.status(500).json({ error: "Failed to process the professional inquiry." });
    }
});
// backend/routes/collaboration.js - Updated to support Profile Visibility
router.get('/faculty/incoming', protect, async (req, res) => {
    try {
        // Find requests where the receiver matches the logged-in faculty email
        const requests = await Collaboration.find({ receiverEmail: req.user.email })
            .populate('sender', 'name department enrollmentNo email profilePicture achievements') // 🟢 Pulls full student profile
            .sort({ createdAt: -1 });
            
        res.json(requests);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch student proposals" });
    }
});

module.exports = router;