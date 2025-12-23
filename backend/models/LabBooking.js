const mongoose = require('mongoose');

const labBookingSchema = new mongoose.Schema({
    labName: { type: String, required: true },
    facultyEmail: { type: String, required: true },
    date: { type: String, required: true },
    timeSlot: { type: String, required: true },
    reason: { type: String, required: true },

    // 🟢 Store the email the student entered for notifications
    confirmationEmail: { type: String, required: true },

    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('LabBooking', labBookingSchema);