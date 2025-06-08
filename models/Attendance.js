// backend/models/Attendance.js
const pool = require('../config/db');

const Attendance = {
  async mark(user_id, status, date) {
    const result = await pool.query(
      'INSERT INTO attendance (user_id, status, date) VALUES ($1, $2, $3) RETURNING *',
      [user_id, status, date]
    );
    return result.rows[0];
  },

  async getByUserAndDate(user_id, date) {
    const result = await pool.query(
      'SELECT * FROM attendance WHERE user_id = $1 AND date = $2',
      [user_id, date]
    );
    return result.rows[0];
  },

  async getTodayAttendance(date) {
    const result = await pool.query(
      `SELECT users.name, attendance.status 
       FROM attendance 
       JOIN users ON users.id = attendance.user_id 
       WHERE attendance.date = $1`,
      [date]
    );
    return result.rows;
  }
};

module.exports = Attendance;
