const mongoose = require('mongoose');

const CollaborationSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiverEmail: { type: String, required: true },

    // 🟢 Registration Details (Preserved & Expanded)
    senderName: { type: String, required: true },
    senderEmail: { type: String, required: true },
    senderRole: { type: String, required: true },
    senderDepartment: { type: String },
    senderEnrollment: { type: String },
    senderLinkedIn: { type: String }, // New
    senderAchievements: { type: String }, // New

    // 🟢 Project Technicals (Preserved & Expanded)
    projectTitle: { type: String },
    domain: { type: String },
    projectGithub: { type: String },
    researchPaperLink: { type: String, required: true },
    projectDescription: { type: String }, // New

    message: { type: String },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Collaboration', CollaborationSchema);