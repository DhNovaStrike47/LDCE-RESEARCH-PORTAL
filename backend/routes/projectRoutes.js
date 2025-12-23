const express = require('express');
const router = express.Router();
const Project = require('../models/project');
const User = require('../models/user');
const protect = require('../middleware/authmiddleware');
const multer = require('multer');
const path = require('path');
const sendEmail = require('../utils/sendEmail');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, 'Synopsis-' + Date.now() + path.extname(file.originalname))
});
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') cb(null, true);
        else cb(new Error('Only PDF files are allowed!'), false);
    }
});

router.get('/', protect, async(req, res) => {
    try {
        const projects = await Project.find().populate('student', '_id name email role department').sort({ createdAt: -1 });
        res.json(projects);
    } catch (err) { res.status(500).json({ message: "Server Error" }); }
});

router.post('/add', protect, upload.single('synopsis'), async(req, res) => {
    try {
        const { title, description, domain, projectYear, projectType, teamMembers, githubLink, researchPaper, isFunded, fundingAgency, demandedFund, grantedFund } = req.body;

        if (!title || !description || !domain || !projectYear || !projectType) {
            return res.status(400).json({ error: "Required fields missing" });
        }

        const isAuth = req.user.role === 'faculty' || req.user.role === 'principal';
        const isFundedCheck = (isFunded === 'true' || isFunded === true);

        if (!isAuth && !req.file) return res.status(400).json({ error: "Synopsis required" });
        if (isAuth && !researchPaper) return res.status(400).json({ error: "DOI required" });

        let parsedTeam = [];
        try { parsedTeam = teamMembers ? JSON.parse(teamMembers) : []; } catch (e) { parsedTeam = []; }

        const project = new Project({
            student: req.user.id,
            title,
            description,
            domain,
            projectYear,
            projectType,
            githubLink: githubLink || '',
            researchPaper: isAuth ? researchPaper : '',
            fileUrl: req.file ? `/uploads/${req.file.filename}` : '',
            teamMembers: parsedTeam,
            isFunded: isFundedCheck,
            fundingAgency: isFundedCheck ? fundingAgency : '',
            demandedFund: isFundedCheck ? demandedFund : '',
            grantedFund: isFundedCheck ? grantedFund : '',
            amountGranted: isFundedCheck ? Number(grantedFund) : 0,
            status: isAuth ? 'Approved' : 'Pending',
            approvedBy: isAuth ? req.user.id : undefined
        });

        await project.save();
        res.status(201).json({ message: "Project Added", project });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/update/:id', protect, async(req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: "Not found" });
        if (project.student.toString() !== req.user.id) return res.status(403).json({ message: "Denied" });

        if (project.status !== 'Pending') {
            project.history.push({
                title: project.title,
                description: project.description,
                fileUrl: project.fileUrl,
                versionNumber: project.version
            });
            project.version = project.version + 1;
            project.status = 'Pending';
        }

        const { title, description, domain, githubLink } = req.body;
        project.title = title || project.title;
        project.description = description || project.description;
        project.domain = domain || project.domain;
        project.githubLink = githubLink || project.githubLink;

        await project.save();
        res.json({ message: "Updated", project });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', protect, async(req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: "Not found" });
        const canDelete = (project.student.toString() === req.user.id) || (req.user.role === 'faculty') || (req.user.role === 'principal');
        if (!canDelete) return res.status(403).json({ message: "Denied" });

        await Project.findByIdAndDelete(req.params.id);
        res.json({ message: "Deleted" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/approve/:id', protect, async(req, res) => {
    if (req.user.role !== 'faculty' && req.user.role !== 'principal') return res.status(403).json({ message: "Denied" });

    try {
        const { status } = req.body;
        const project = await Project.findById(req.params.id).populate('student', 'email name');
        if (!project) return res.status(404).json({ message: "Not found" });

        project.status = status;
        project.approvedBy = req.user.id;
        await project.save();

        // 🟢 Logic Change: Standard Conditional instead of Optional Chaining
        let emails = [];
        if (project.student && project.student.email) {
            emails.push(project.student.email);
        }

        if (project.teamMembers && project.teamMembers.length > 0) {
            project.teamMembers.forEach(m => {
                if (m.email) emails.push(m.email);
            });
        }

        if (emails.length > 0) {
            try {
                await Promise.all(emails.map(email =>
                    sendEmail({
                        to: email,
                        subject: `Project Update: ${status}`,
                        html: `<p>Your project "${project.title}" has been updated to ${status}.</p>`
                    })
                ));
            } catch (e) { console.error("Mail error ignored"); }
        }

        res.json(project);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', protect, async(req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        res.json(project);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/file/:filename', protect, (req, res) => {
    res.sendFile(path.join(__dirname, '../uploads', req.params.filename));
});

module.exports = router;