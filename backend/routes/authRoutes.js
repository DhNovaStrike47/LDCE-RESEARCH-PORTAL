const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const router = express.Router();

// REGISTER API
router.post('/register', async(req, res) => {
    try {
        const {
            name,
            email,
            password,
            role,
            department,
            enrollmentNo,
            linkedIn,
            achievements,
            studyProgram,
            semester,
            qualification,
            designation
        } = req.body;

        // 🟢 1. STRICT VALIDATION: Common Fields
        if (!name || !email || !password || !department || !linkedIn || !achievements) {
            return res.status(400).json({ message: "All fields (including LinkedIn & Achievements) are compulsory." });
        }

        // 🟢 2. STRICT VALIDATION: Role Specific
        if (role === 'student') {
            if (!enrollmentNo || !studyProgram || !semester) {
                return res.status(400).json({ message: "Student: Enrollment No, Program, and Semester are required." });
            }
        } else if (role === 'faculty') {
            if (!enrollmentNo || !qualification || !designation) {
                return res.status(400).json({ message: "Faculty: ID, Qualification, and Designation are required." });
            }
        }

        // 3. Check if Email exists
        const emailExists = await User.findOne({ email });
        if (emailExists) return res.status(400).json({ message: 'Email already registered' });

        // 4. Check if Enrollment/ID exists
        if (enrollmentNo) {
            const idExists = await User.findOne({ enrollmentNo });
            if (idExists) return res.status(400).json({ message: 'Enrollment/ID already registered' });
        }

        // 5. Hash Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 6. Create User
        const user = new User({
            name,
            email,
            password: hashedPassword,
            role: role || 'student',
            department,
            enrollmentNo,
            linkedIn,
            achievements,
            // Only save fields relevant to the role
            studyProgram: role === 'student' ? studyProgram : undefined,
            semester: role === 'student' ? semester : undefined,
            qualification: role === 'faculty' ? qualification : undefined,
            designation: role === 'faculty' ? designation : undefined
        });

        await user.save();

        // 7. Generate Token
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department
            }
        });
    } catch (err) {
        console.error("Register Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// LOGIN API
router.post('/login', async(req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid Credentials" });

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });

        res.json({
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;