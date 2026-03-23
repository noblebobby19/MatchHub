import cron from 'node-cron';
import https from 'https';

const URL = 'https://matchhub-be.onrender.com/api/health';

const startPingServerJob = () => {
  // Chạy mỗi 14 phút (trước khi Render tự sleep ở 15 phút)
  cron.schedule('*/14 * * * *', () => {
    console.log('⏰ [Cron Job] Pinging server to prevent sleep...');
    https.get(URL, (res) => {
      if (res.statusCode === 200) {
        console.log('✅ [Cron Job] Server pinged successfully');
      } else {
        console.error(`❌ [Cron Job] Server ping failed with status: ${res.statusCode}`);
      }
    }).on('error', (err) => {
      console.error('❌ [Cron Job] Error during server ping:', err.message);
    });
  });
};

export default startPingServerJob;
