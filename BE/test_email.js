import sendEmail from './src/utils/sendEmail.js';

sendEmail({
  email: 'thiendautrau12345@gmail.com',
  subject: '✅ MatchHub – Test Email Direct From Server!',
  message: '<h2>Nếu bạn nhận được email này, cấu hình gửi email hoàn toàn bình thường!</h2>'
}).then(() => {
  console.log('✅ TEST SEND SUCCESS');
}).catch(err => {
  console.error('❌ TEST SEND FAILED:', err);
});
