// backend/utils/emailTemplates.js

const getEmailTemplate = (studentName, title, status, message) => {
    const color = status === 'Approved' ? '#16a34a' : '#dc2626'; // Green or Red
    const statusIcon = status === 'Approved' ? '✅' : '❌';

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; }
            .header { background-color: #1e3a8a; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px; background-color: #ffffff; }
            .status-box { background-color: #f3f4f6; padding: 15px; border-left: 5px solid ${color}; margin: 20px 0; border-radius: 4px; }
            .footer { background-color: #f9fafb; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; }
            .btn { display: inline-block; padding: 10px 20px; background-color: #fbbf24; color: #1e3a8a; text-decoration: none; font-weight: bold; border-radius: 5px; margin-top: 20px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>LDCE Research Portal</h2>
            </div>
            <div class="content">
                <p>Dear <strong>${studentName}</strong>,</p>
                <p>The status of your project submission <em>"${title}"</em> has been updated.</p>
                
                <div class="status-box">
                    <h3 style="color: ${color}; margin: 0;">${statusIcon} Status: ${status}</h3>
                    <p style="margin-top: 5px;">${message}</p>
                </div>

                <p>Please login to the portal to view remarks or download your synopsis.</p>
                
                <center>
                    <a href="https://your-deployed-link.com" class="btn">Go to Dashboard</a>
                </center>
            </div>
            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} L.D. College of Engineering. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

module.exports = { getEmailTemplate };