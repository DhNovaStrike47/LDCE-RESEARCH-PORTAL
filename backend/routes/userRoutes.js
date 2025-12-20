const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Project = require('../models/project');
const bcrypt = require('bcryptjs');
const protect = require('../middleware/authmiddleware');

// 1. GET PROFILE (Updated for Faculty)
router.get('/profile', protect, async(req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ message: "User not found" });

        // 1. Fetch "My Projects" (Created by this user)
        const myProjects = await Project.find({ student: req.user.id });

        // 2. 🟢 NEW: If Faculty, fetch "Projects Approved By Me"
        let approvedProjects = [];
        if (user.role === 'faculty') {
            approvedProjects = await Project.find({ approvedBy: req.user.id }).populate('student', 'name');
        }

        res.json({ user, myProjects, approvedProjects });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. UPDATE DETAILS
router.put('/update-details', protect, async(req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (user) {
            user.name = req.body.name || user.name;
            const updatedUser = await user.save();
            res.json(updatedUser);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. CHANGE PASSWORD
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