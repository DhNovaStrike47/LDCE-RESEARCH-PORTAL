const nodemailer = require('nodemailer');

const sendEmail = async(options) => {
    // 1. Create the Transporter (The Mailman)
    const transporter = nodemailer.createTransport({
        service: 'gmail', // You can use 'hotmail' or others
        auth: {
            user: process.env.EMAIL_USER, // Your Email ID (Stored in .env)
            pass: process.env.EMAIL_PASS // Your App Password (Stored in .env)
        }
    });

    // 2. Define the Email Options
    const mailOptions = {
        from: `"LDCE Research Portal" <${process.env.EMAIL_USER}>`, // System Name
        to: options.to,
        replyTo: options.replyTo, // 🟢 CRITICAL: Faculty replies go to Student
        subject: options.subject,
        html: options.html
    };

    // 3. Send the Email
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;