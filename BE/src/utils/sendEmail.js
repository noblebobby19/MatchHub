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
    },
    pool: true,
    maxConnections: 1,
    maxMessages: 10,
    tls: {
        rejectUnauthorized: false
    }
});

const sendEmail = async (options) => {

    // Define email options
    const mailOptions = {
        from: `"MatchHub Support" <${process.env.MAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        html: options.message
    };

    // Send email with 5s timeout to prevent serverless function hangs
    const sendPromise = transporter.sendMail(mailOptions);
    const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Nodemailer timeout exceed 5000ms')), 5000)
    );

    await Promise.race([sendPromise, timeoutPromise]);
};

export default sendEmail;
