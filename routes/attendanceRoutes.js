const express = require("express");
const router = express.Router();
const { markAttendance, getTodayAttendance, getAttendanceByDate, getWeeklySummary, } = require("../controllers/attendanceController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/mark", authMiddleware, markAttendance);
router.get("/today", authMiddleware, getTodayAttendance);
router.get("/date/:date", authMiddleware, getAttendanceByDate);
router.get("/summary/week", authMiddleware, getWeeklySummary);


module.exports = router;
