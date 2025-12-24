const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
    collaborationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Collaboration', required: true },
    phase: { type: String, required: true },
    report: { type: String, required: true },
    submittedBy: { type: String, enum: ['Student', 'Faculty'], required: true }
}, { timestamps: true });

module.exports = mongoose.model('Milestone', milestoneSchema);