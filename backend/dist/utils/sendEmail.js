const nodemailer = require("nodemailer");
require("dotenv").config();

const sendEmail = async (to, subject, text) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject,
            text,
        };

        await transporter.sendMail(mailOptions);
        console.log("✅ Email sent successfully!");
        return { success: true, message: "Email sent successfully!" };
    } catch (error) {
        console.error("❌ Error sending email:", error);
        return { success: false, message: "Error sending email!", error };
    }
};

module.exports = sendEmail;
