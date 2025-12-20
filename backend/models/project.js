const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    domain: { type: String, required: true },
    department: { type: String, required: true },

    // 🟢 NEW FIELD FOR PDF SYNOPSIS (Day 7)
    fileUrl: { type: String, default: '' },

    // --- ACADEMIC DETAILS ---
    projectYear: { type: String, required: true },
    program: { type: String, required: true },
    currentYear: { type: String, default: '' },
    semester: { type: String, default: '' },

    // 🟢 EXISTING NEW FIELDS
    researchPaper: { type: String, default: '' }, // For PhD or Faculty Links
    mentor: { type: String, default: '' }, // For Students
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // To track which Faculty approved it

    // Funding Details
    isFunded: { type: Boolean, default: false },
    fundingAgency: { type: String, default: '' },
    demandedFund: { type: String, default: '' },
    grantedFund: { type: String, default: '' },
    amountGranted: { type: Number, default: 0 },

    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, default: 'Pending' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Project', projectSchema);