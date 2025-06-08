const Attendance = require('../models/Attendance');
const pool = require('../config/db');

const markAttendance = async (req, res) => {
    const user_id = req.user.id;
    const status = req.body.status;
    console.log("📩 Received status from frontend:", status);
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const isAfterCutoff = currentHour > 9 || (currentHour === 9 && currentMinute >= 30);

    let inputDate = req.body.date ? new Date(req.body.date) : new Date(now);
    inputDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Don’t allow past dates
    if (inputDate < today) {
      return res.status(400).json({ message: 'Cannot mark attendance for past dates' });
    }

    // If user is submitting for today and it’s after 9:30 AM, shift to tomorrow
    if (
      inputDate.toISOString().slice(0, 10) === today.toISOString().slice(0, 10) &&
      isAfterCutoff
    ) {
      inputDate.setDate(inputDate.getDate() + 1);
    }

    const date = inputDate.toISOString().slice(0, 10);



  if (!["office", "home", "leave"].includes(status)) {
    return res.status(400).json({ message: 'Invalid attendance status' });
  }

  try {
    const existing = await Attendance.getByUserAndDate(user_id, date);
    if (existing) {
      return res.status(400).json({ message: 'Attendance already marked today' });
    }

    const marked = await Attendance.mark(user_id, status, date);
    res.status(201).json({ message: 'Attendance marked', data: marked });
  } catch (err) {
    console.error('Attendance error:', err);
    console.error(err.stack); // full error trace
    res.status(500).json({ message: 'Error marking attendance' });
  }
};

const getTodayAttendance = async (req, res) => {
  const date = new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'

  try {
    const records = await Attendance.getTodayAttendance(date);
    res.json(records);
  } catch (err) {
    console.error('Fetch attendance error:', err);
    console.error(err.stack); // full error trace
    res.status(500).json({ message: 'Error fetching attendance' });
  }
};

const getAttendanceByDate = async (req, res) => {
  const date = req.params.date;

  try {
    const records = await Attendance.getTodayAttendance(date); // reuse same model
    res.json(records);
  } catch (err) {
    console.error("Error fetching attendance by date:", err);
    res.status(500).json({ message: "Error fetching records" });
  }
};

const getWeeklySummary = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        date,
        SUM(CASE WHEN status = 'office' THEN 1 ELSE 0 END) AS office,
        SUM(CASE WHEN status = 'home' THEN 1 ELSE 0 END) AS home,
        SUM(CASE WHEN status = 'leave' THEN 1 ELSE 0 END) AS leave
      FROM attendance
      WHERE date >= CURRENT_DATE - INTERVAL '6 days'
      GROUP BY date
      ORDER BY date ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("Weekly summary error:", err);
    res.status(500).json({ message: "Error loading summary" });
  }
};



module.exports = {
  markAttendance,
  getTodayAttendance,
  getAttendanceByDate,
  getWeeklySummary,
};

