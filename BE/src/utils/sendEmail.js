import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    }
});

const sendEmail = async (options) => {
    const mailOptions = {
        from: `"MatchHub Support" <${process.env.MAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        html: options.message
    };

    // Send email without arbitrary JS timeout to guarantee delivery even if Vercel is slow
    await transporter.sendMail(mailOptions);
};

export default sendEmail;
