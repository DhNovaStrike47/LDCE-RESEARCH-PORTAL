// Professional HTML Email Design
const baseTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 650px; margin: 20px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; letter-spacing: 1px; }
        .content { padding: 40px; }
        .detail-box { background: #f8fafc; border-left: 5px solid #3b82f6; padding: 20px; margin: 20px 0; border-radius: 4px; }
        .label { font-weight: bold; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
        .value { color: #1e293b; font-size: 16px; font-weight: 600; margin-bottom: 12px; display: block; }
        .footer { background: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
        .btn { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>LDCE Research & Lab Portal</h1>
        </div>
        <div class="content">
            ${content}
        </div>
        <div class="footer">
            <p>This is an automated message. You can reply directly to this email to contact the student.</p>
            <p>&copy; ${new Date().getFullYear()} L.D. College of Engineering</p>
        </div>
    </div>
</body>
</html>
`;

const getLabBookingTemplate = (student, project, booking) => {
    return baseTemplate(`
        <h2 style="color: #1e3a8a; margin-top: 0;">🧪 New Lab Booking Request</h2>
        <p style="font-size: 16px;">Dear Faculty,</p>
        <p>A new lab slot booking request has been submitted by <strong>${student.name}</strong>.</p>

        <div class="detail-box">
            <span class="label">Student Details</span>
            <span class="value">${student.name} (${student.enrollmentNo})</span>
            <span class="value">${student.email} | ${student.department}</span>

            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 15px 0;">

            <span class="label">Project Title</span>
            <span class="value">${project.title}</span>

            <span class="label">Requested Slot</span>
            <span class="value">📅 ${booking.date}</span>
            <span class="value">⏰ ${booking.timeSlot}</span>
            <span class="value">📍 ${booking.labName}</span>

            <span class="label">Purpose</span>
            <p style="margin: 5px 0 0 0;">${booking.reason}</p>
        </div>

        <p>Please log in to the portal to <strong>Approve</strong> or <strong>Reject</strong> this request.</p>
        <center>
            <a href="http://localhost:5173/faculty-dashboard" class="btn">Go to Dashboard</a>
        </center>
    `);
};

module.exports = { getLabBookingTemplate };