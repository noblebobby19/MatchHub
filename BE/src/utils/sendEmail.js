import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true = 465, false = STARTTLS cho cổng khác
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

    // Vercel thường chặn đường TCP lâu nếu không may, ta bọc thời hạn tối đa 8.5 giây để nhả response cho người dùng,
    // tránh trường hợp trên frontend cứ xoay tròn mãi mãi do SMTP host treo.
    const sendPromise = transporter.sendMail(mailOptions);
    const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Nodemailer bị nghẽn mạng hoặc quá tải trên Vercel (>8.5 giây)')), 8500)
    );

    await Promise.race([sendPromise, timeoutPromise]);
};

export default sendEmail;
