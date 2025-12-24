const express = require('express');
const router = express.Router();
const Milestone = require('../models/Milestone');
const protect = require('../middleware/authmiddleware');

router.get('/:collaborationId', protect, async(req, res) => {
    try {
        const milestones = await Milestone.find({ collaborationId: req.params.collaborationId }).sort({ createdAt: -1 });
        res.json(milestones);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/add', protect, async(req, res) => {
    try {
        const newMilestone = new Milestone(req.body);
        await newMilestone.save();
        res.status(201).json(newMilestone);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;