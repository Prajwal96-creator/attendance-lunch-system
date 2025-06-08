import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";


export default function Dashboard() {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [trendData, setTrendData] = useState([]);

  const fetchTrend = async () => {
   try {
    const res = await API.get("/attendance/summary/week");
    const formatted = res.data.map((d) => ({
      date: d.date.slice(5), // Show MM-DD
      office: parseInt(d.office),
      home: parseInt(d.home),
      leave: parseInt(d.leave),
    }));
    setTrendData(formatted);
  } catch (err) {
    console.error("Error fetching trend", err);
  }
};

useEffect(() => {
  fetchTrend();
}, []);

  const formattedDate = selectedDate.toISOString().split("T")[0];

  const loadAttendance = async (dateStr) => {
    try {
      setLoading(true);
      const res = await API.get(`/attendance/date/${dateStr}`);
      setAttendance(res.data);
    } catch (err) {
      console.error("Error loading attendance", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance(formattedDate);
  }, [formattedDate]);

  if (!user) return <div className="p-4 text-center">Not authorized</div>;
  if (user.role !== "admin") return <div className="p-4 text-center">Unauthorized</div>;

  // Count summary
  const summary = {
    office: attendance.filter((a) => a.status === "office").length,
    home: attendance.filter((a) => a.status === "home").length,
    leave: attendance.filter((a) => a.status === "leave").length,
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

      {/* 📅 Date Filter */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Select Date</label>
        <input
          type="date"
          value={formattedDate}
          onChange={(e) => setSelectedDate(new Date(e.target.value))}
          className="border px-3 py-2 rounded-md shadow-sm"
        />
      </div>

      {/* 📊 Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <div className="bg-green-100 text-green-700 p-4 rounded-lg shadow text-center">
          <p className="text-lg font-semibold">{summary.office}</p>
          <p className="text-sm">Office</p>
        </div>
        <div className="bg-blue-100 text-blue-700 p-4 rounded-lg shadow text-center">
          <p className="text-lg font-semibold">{summary.home}</p>
          <p className="text-sm">Home</p>
        </div>
        <div className="bg-red-100 text-red-700 p-4 rounded-lg shadow text-center">
          <p className="text-lg font-semibold">{summary.leave}</p>
          <p className="text-sm">Leave</p>
        </div>
      </div>

      {/* 📊 Weekly Attendance Trend */}
        <div className="bg-white rounded shadow p-4 mt-6">
          <h2 className="text-lg font-semibold mb-3">Attendance Trend (Last 7 Days)</h2>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="office" stackId="a" fill="#34D399" name="Office" />
              <Bar dataKey="home" stackId="a" fill="#60A5FA" name="Home" />
              <Bar dataKey="leave" stackId="a" fill="#F87171" name="Leave" />
            </BarChart>
           </ResponsiveContainer>
        </div>


      {/* 📋 Table */}
      <div className="bg-white rounded shadow p-4">
        <h2 className="text-xl font-semibold mb-3">Attendance for {formattedDate}</h2>
        {loading ? (
          <p>Loading attendance...</p>
        ) : attendance.length === 0 ? (
          <p>No attendance records found.</p>
        ) : (
          <table className="w-full table-auto border">
            <thead>
              <tr className="bg-gray-200">
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((a, i) => (
                <tr key={i} className="border-t">
                  <td className="px-4 py-2">{a.name}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        a.status === "office"
                          ? "bg-green-100 text-green-700"
                          : a.status === "home"
                          ? "bg-blue-100 text-blue-700"
                          : a.status === "leave"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
