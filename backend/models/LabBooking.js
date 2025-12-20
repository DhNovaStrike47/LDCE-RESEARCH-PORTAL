const mongoose = require('mongoose');

const labBookingSchema = new mongoose.Schema({
    labName: { type: String, required: true }, // e.g., "IoT Lab"
    date: { type: String, required: true }, // e.g., "2025-01-20"
    timeSlot: { type: String, required: true }, // e.g., "10:00 AM - 12:00 PM"
    reason: { type: String, required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('LabBooking', labBookingSchema);