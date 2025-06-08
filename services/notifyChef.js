const cron = require('node-cron');
const nodemailer = require('nodemailer');
const Attendance = require('../models/Attendance');
const dayjs = require('dayjs');
const pool = require('../config/db');

const sendChefNotification = async () => {
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday, 6 = Saturday

  // ⏭️ Skip weekends
  if (day === 0 || day === 6) {
    console.log("⏳ Skipping chef notification — it's a weekend.");
    return;
  }

  const date = now.toISOString().slice(0, 10);

  try {
    const attendance = await Attendance.getTodayAttendance(date);
    const officeCount = attendance.filter((a) => a.status === 'office').length;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: process.env.SMTP_EMAIL,
      to: process.env.CHEF_EMAIL,
      subject: 'Today’s Lunch Count',
      text: `👨‍🍳 Total employees working from office today (${date}): ${officeCount}`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Chef notified at 9:30 AM. Office count: ${officeCount}`);
  } catch (err) {
    console.error('❌ Error sending chef notification:', err);
  }
};

// ⏰ Schedule job to run every day at 9:30 AM (server time)
const startChefCronJob = () => {
  cron.schedule('30 9 * * *', () => {
    console.log('🔔 Running 9:30 AM chef notification job...');
    sendChefNotification();
  });
};

module.exports = {
  startChefCronJob,
  sendChefNotification,
};
