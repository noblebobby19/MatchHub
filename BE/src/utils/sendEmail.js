import dotenv from 'dotenv';
dotenv.config();

// Backend Render chỉ gọi qua API Vercel bằng lệnh POST HTTPS để vượt khóa mạng.
const sendEmail = async (options) => {
    const payload = {
        email: options.email,
        subject: options.subject,
        message: options.message,
        mailUser: process.env.MAIL_USER,
        mailPass: process.env.MAIL_PASS
    };

    // Timeout 8.5s khống chế
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8500);

    // Xác định đích đến (URL Vercel hoặc local)
    // process.env.CLIENT_URL là link gốc của frontend vd: https://match-hub-opal.vercel.app
    const clientURL = process.env.CLIENT_URL || 'http://localhost:3000';
    const proxyUrl = `${clientURL}/api/sendEmail`;

    try {
        const response = await fetch(proxyUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': 'matchhub_secret_key_12345'
            },
            body: JSON.stringify(payload),
            signal: controller.signal
        });

        clearTimeout(timeout);

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Lỗi gửi mail qua Vercel Proxy');
        }
    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error('Vercel API Proxy quá tải phản hồi > 8.5s');
        }
        throw new Error(error.message || 'Lỗi Proxy gửi mail kết nối');
    }
};

export default sendEmail;
