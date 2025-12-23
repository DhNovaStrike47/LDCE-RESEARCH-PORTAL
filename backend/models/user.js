const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    // --- Common Fields ---
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: ['student', 'faculty', 'admin', 'principal'],
        default: 'student',
        required: true
    },
    department: { type: String, required: true },

    linkedIn: { type: String, required: true },
    achievements: { type: String, required: true },

    // 🟢 NEW: Profile Picture
    profilePicture: { type: String, default: '' },

    // --- Student Specific ---
    enrollmentNo: { type: String },
    studyProgram: { type: String, enum: ['BE', 'ME'] },
    semester: { type: Number },

    // --- Faculty Specific ---
    qualification: { type: String, enum: ['MTech', 'PhD'] },
    designation: { type: String }
}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);