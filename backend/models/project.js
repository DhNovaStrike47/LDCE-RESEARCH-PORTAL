const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    domain: { type: String, required: true },
    projectType: { type: String, enum: ['IDP', 'UDP'], required: true },
    projectYear: { type: String, required: true },
    fileUrl: { type: String, default: '' },
    githubLink: { type: String, default: '' },
    researchPaper: { type: String, default: '' },
    teamMembers: [{
        name: { type: String },
        email: { type: String }
    }],
    mentor: { type: String, default: '' },
    isFunded: { type: Boolean, default: false },
    fundingAgency: { type: String },
    demandedFund: { type: String },
    grantedFund: { type: String },
    amountGranted: { type: Number, default: 0 },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, default: 'Pending' },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    version: { type: Number, default: 1 },
    history: [{
        title: String,
        description: String,
        fileUrl: String,
        updatedAt: { type: Date, default: Date.now },
        versionNumber: Number
    }]
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);