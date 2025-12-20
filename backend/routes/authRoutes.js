const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const router = express.Router();

// REGISTER API
router.post('/register', async(req, res) => {
    try {
        const { name, email, password, role, department, enrollmentNo } = req.body;

        // 1. Check if Email exists
        const emailExists = await User.findOne({ email });
        if (emailExists) return res.status(400).json({ message: 'Email already registered' });

        // 2. 🟢 NEW: Check if Enrollment/ID exists
        // We only check if 'enrollmentNo' is provided (since Admins might not have one)
        if (enrollmentNo) {
            const idExists = await User.findOne({ enrollmentNo });
            if (idExists) return res.status(400).json({ message: 'Enrollment/Faculty ID already registered' });
        }

        // 3. Hash Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 4. Create User
        const user = new User({
            name,
            email,
            password: hashedPassword,
            role: role || 'student',
            department,
            enrollmentNo
        });

        await user.save();

        // 5. Generate Token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// LOGIN API (No changes needed, but keeping it for completeness)
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