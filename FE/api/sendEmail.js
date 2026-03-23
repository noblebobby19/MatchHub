import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // Bật CORS cho phép Render gọi sang Vercel
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Khóa API siêu cấp bảo mật để ngăn spam mạng chùa
  if (req.headers['x-api-key'] !== 'matchhub_secret_key_12345') {
    return res.status(401).json({ error: 'Unauthorized origin' });
  }

  const { email, subject, message, mailUser, mailPass } = req.body;

  if (!email || !mailUser || !mailPass) {
    return res.status(400).json({ error: 'Missing required validation fields' });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // TLS
      auth: {
        user: mailUser,
        pass: mailPass,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    await transporter.sendMail({
      from: `"MatchHub Support" <${mailUser}>`,
      to: email,
      subject: subject,
      html: message,
    });

    // Trả result về cho Server Render
    res.status(200).json({ success: true, message: 'Vercel delivered the email' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
