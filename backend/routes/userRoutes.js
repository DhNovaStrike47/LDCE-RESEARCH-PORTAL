const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Project = require('../models/project');
const bcrypt = require('bcryptjs');
const protect = require('../middleware/authmiddleware');
const multer = require('multer');
const path = require('path');

// --- MULTER CONFIG FOR PROFILE PICS ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, 'Profile-' + Date.now() + path.extname(file.originalname))
});
const upload = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB Limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) cb(null, true);
        else cb(new Error('Only image files are allowed!'), false);
    }
});

// 1. GET PROFILE
router.get('/profile', protect, async(req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ message: "User not found" });

        const myProjects = await Project.find({ student: req.user.id });

        let approvedProjects = [];
        if (user.role === 'faculty') {
            approvedProjects = await Project.find({ approvedBy: req.user.id }).populate('student', 'name');
        }

        res.json({ user, myProjects, approvedProjects });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. 🟢 UPDATE DETAILS (Supports Profile Picture)
router.put('/update-details', protect, upload.single('profilePicture'), async(req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const {
            name,
            linkedIn,
            achievements,
            semester,
            studyProgram,
            qualification,
            designation
        } = req.body;

        // Update Text Fields
        if (name) user.name = name;
        if (linkedIn !== undefined) user.linkedIn = linkedIn;
        if (achievements !== undefined) user.achievements = achievements;

        // Update Profile Picture if uploaded
        if (req.file) {
            user.profilePicture = `/uploads/${req.file.filename}`;
        }

        // Role Specific
        if (user.role === 'student') {
            if (semester) user.semester = semester;
            if (studyProgram) user.studyProgram = studyProgram;
        }
        if (user.role === 'faculty') {
            if (qualification) user.qualification = qualification;
            if (designation) user.designation = designation;
        }

        const updatedUser = await user.save();
        res.json(updatedUser);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. CHANGE PASSWORD (Unchanged)
router.put('/change-password', protect, async(req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const user = await User.findById(req.user.id);
        if (user && (await bcrypt.compare(oldPassword, user.password))) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
            await user.save();
            res.json({ message: 'Success' });
        } else {
            res.status(400).json({ message: 'Invalid Old Password' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;