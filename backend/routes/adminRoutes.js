const express = require('express');
const router = express.Router();
const Project = require('../models/project');
const LabBooking = require('../models/LabBooking');
const User = require('../models/user');
const protect = require('../middleware/authmiddleware');

router.get('/stats', protect, async(req, res) => {
    try {
        // 1. Security Check
        if (req.user.role !== 'principal') {
            return res.status(403).json({ message: "Access Denied: Principal Only" });
        }

        // 2. Fetch Stats
        const totalProjects = await Project.countDocuments();
        const totalStudents = await User.countDocuments({ role: 'student' });
        const totalFaculty = await User.countDocuments({ role: 'faculty' });

        // 3. Calculate Grant Money
        const projects = await Project.find({ isFunded: true });
        const totalGrant = projects.reduce((acc, curr) => acc + (curr.amountGranted || 0), 0);

        // 4. Recent Data
        const recentProjects = await Project.find().sort({ createdAt: -1 }).limit(5).populate('student', 'name');
        const recentLabs = await LabBooking.find().sort({ createdAt: -1 }).limit(5).populate('student', 'name');

        res.json({
            stats: { totalProjects, totalStudents, totalFaculty, totalGrant },
            recentProjects,
            recentLabs
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;