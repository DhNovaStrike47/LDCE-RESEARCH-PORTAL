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
        from: `LDCE Portal <${process.env.EMAIL_USER}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html // Allows bold text and formatting
    };

    // 3. Send the Email
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;