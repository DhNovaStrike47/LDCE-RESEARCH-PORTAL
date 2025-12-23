require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
const path = require('path'); // Import path

const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const labRoutes = require('./routes/labRoutes');
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');
const collaborationRoutes = require('./routes/collaboration');

const app = express();

connectDB();

app.use(cors({
    origin: ["http://localhost:5173", "https://your-frontend-app-name.vercel.app"],
    credentials: true
}));

app.use(express.json());

// 🟢 NEW: Serve Uploads Folder Statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/labs', labRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/collaboration', require('./routes/collaboration'));
app.use('/api/collaboration', collaborationRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on Port ${PORT}`));