import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../api";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import { format } from "date-fns";

export default function EmployeeCalendar() {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await API.get("/attendance/today"); // or create /api/attendance/me if needed
        setAttendance(res.data.filter((a) => a.name === user.name));
      } catch (err) {
        console.error("Error fetching history", err);
      }
    };

    fetchAttendance();
  }, [user]);

const tileClassName = ({ date }) => {
  const formatted = format(date, "yyyy-MM-dd");
  const match = attendance.find((a) => a.date?.startsWith(formatted));
  if (!match) return "";

  if (match.status === "office") return "bg-green-200 text-green-900 rounded";
  if (match.status === "home") return "bg-blue-200 text-blue-900 rounded";
  if (match.status === "leave") return "bg-red-200 text-red-900 rounded";
  return "";
};


  if (!user || user.role !== "employee") {
    return <div className="p-6 text-center">Unauthorized</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 p-6">
      <div className="bg-white p-6 rounded shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-center">My Attendance Calendar</h2>
        <Calendar
          onChange={setSelectedDate}
          value={selectedDate}
          tileClassName={tileClassName}
        />
      </div>
    </div>
  );
}
