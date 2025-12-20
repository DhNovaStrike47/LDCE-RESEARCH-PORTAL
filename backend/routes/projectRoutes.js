const express = require('express');
const router = express.Router();
const Project = require('../models/project');
const protect = require('../middleware/authmiddleware');
const sendEmail = require('../utils/sendEmail');
const multer = require('multer');
const path = require('path');
const { getEmailTemplate } = require('../utils/emailTemplates'); // Ensure this file exists

// 🟢 CONFIGURATION FOR FILE UPLOAD
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed!'), false);
    }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

// 1. ANALYTICS
router.get('/stats', async(req, res) => {
    try {
        const projects = await Project.find();
        const totalProjects = projects.length;
        const fundedProjects = projects.filter(p => p.isFunded).length;
        const totalGrant = projects.reduce((sum, p) => sum + (p.amountGranted || 0), 0);
        const domainStats = {};
        projects.forEach(p => { if (p.domain) domainStats[p.domain] = (domainStats[p.domain] || 0) + 1; });
        res.json({ totalProjects, fundedProjects, totalGrant, domainStats });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 2. ADD PROJECT
router.post('/add', protect, upload.single('synopsis'), async(req, res) => {
    try {
        const newProject = new Project({
            title: req.body.title,
            description: req.body.description,
            domain: req.body.domain,
            department: req.body.department,
            projectYear: req.body.projectYear,
            program: req.body.program,
            currentYear: req.body.currentYear,
            semester: req.body.semester,
            mentor: req.body.mentor,
            researchPaper: req.body.researchPaper,
            fileUrl: req.file ? req.file.path.replace(/\\/g, "/") : "",
            isFunded: req.body.isFunded === 'true',
            fundingAgency: req.body.fundingAgency,
            demandedFund: req.body.demandedFund,
            grantedFund: req.body.grantedFund,
            amountGranted: Number(req.body.grantedFund) || 0,
            student: req.user.id
        });

        await newProject.save();
        res.status(201).json(newProject);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. GET ALL PROJECTS
router.get('/', async(req, res) => {
    try {
        const projects = await Project.find().populate('student', 'name email');
        res.json(projects);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 4. 🟢 APPROVE/REJECT (UPDATED WITH HTML EMAIL TEMPLATE)
router.put('/approve/:id', protect, async(req, res) => {
    try {
        const { status } = req.body;
        const project = await Project.findById(req.params.id).populate('student', 'name email');
        if (!project) return res.status(404).json({ message: "Project not found" });

        project.status = status;
        if (status === 'Approved') project.approvedBy = req.user.id;

        await project.save();

        // 🟢 NEW: Send Professional HTML Email
        if (project.student && project.student.email) {
            try {
                const subject = status === 'Approved' ? "🎉 Project Approved - LDCE Portal" : "⚠️ Project Update - LDCE Portal";

                const msg = status === 'Approved' ?
                    "Congratulations! Your project has been approved by the faculty." :
                    "Your project requires revision or has been rejected. Please contact your faculty mentor for details.";

                await sendEmail({
                    to: project.student.email,
                    subject: subject,
                    // Use the helper function we created in utils/emailTemplates.js
                    html: getEmailTemplate(project.student.name, project.title, status, msg)
                });
                console.log(`Email sent to ${project.student.email}`);
            } catch (emailErr) {
                console.error("Email failed:", emailErr.message);
            }
        }
        res.json({ message: `Project ${status}`, project });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 5. SECURE FILE DOWNLOAD ROUTE
router.get('/file/:filename', protect, (req, res) => {
    const filePath = path.join(__dirname, '../uploads', req.params.filename);
    res.sendFile(filePath, (err) => {
        if (err) {
            console.error("File Send Error:", err);
            res.status(404).json({ message: "File not found or Access Denied" });
        }
    });
});

module.exports = router;