const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
        type: String,
        // 🟢 UPDATED: Added 'principal' to the allowed roles list
        enum: ['student', 'faculty', 'admin', 'principal'],
        default: 'student'
    },
    // Specific Fields
    enrollmentNo: { type: String }, // For Students
    department: { type: String }, // For Faculty
    designation: { type: String } // For Faculty
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);