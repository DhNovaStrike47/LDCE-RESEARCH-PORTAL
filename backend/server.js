require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./db');

// --- Import Routes ---
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const labRoutes = require('./routes/labRoutes');
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
connectDB(); // Connect to Database

// --- Middleware ---
app.use(cors());
app.use(express.json()); // Allow JSON data


// --- Use Routes ---
app.use('/api/auth', authRoutes); // Login/Register
app.use('/api/projects', projectRoutes); // Projects
app.use('/api/labs', labRoutes); // Lab Bookings
app.use('/api/admin', adminRoutes); // Principal/Dean Stats
app.use('/api/users', userRoutes); //for profile

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on Port ${PORT}`));