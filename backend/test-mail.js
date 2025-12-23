require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: { rejectUnauthorized: false }
});

const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER, // Sending to yourself to test
    subject: "🔍 SMTP Connection Test - LDCE Portal",
    text: "If you see this, your Gmail App Password and SMTP configuration are working perfectly!"
};

transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        console.log("❌ Mail Test Failed:", error.message);
    } else {
        console.log("✅ Mail Test Success! Message ID:", info.messageId);
    }
});