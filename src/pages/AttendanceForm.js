import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../api";

export default function AttendanceForm() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { user } = useAuth();
  const [status, setStatus] = useState("office");
  const [message, setMessage] = useState("");
  const [alreadyMarked, setAlreadyMarked] = useState(false);
  const [markingDate, setMarkingDate] = useState("");
  const now = new Date();
  const isAfterCutoff = now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() >= 30);


  useEffect(() => {
    const checkIfMarked = async () => {
      try {
        const res = await API.get("/attendance/today");
        const record = res.data.find((a) => a.name === user.name);

        if (record) {
          setAlreadyMarked(true);
          setMessage("✅ You already marked your attendance today.");
        }
      } catch (err) {
        console.error("Check attendance error:", err);
      }
    };

    checkIfMarked();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/attendance/mark", {
        status,
        date: selectedDate.toISOString().split("T")[0],
      });

      const recordedDate = res.data.dateUsed || new Date().toISOString().slice(0, 10);
      setMarkingDate(recordedDate);
      setMessage(
        res.data?.dateUsed === selectedDate.toISOString().split("T")[0]
         ? `✅ Attendance marked for ${res.data.dateUsed}`
         : `⚠️ It's after 9:30 AM. Marked for next day: ${res.data.dateUsed}`
      );


      setAlreadyMarked(true);
    } catch (err) {
      console.error(err);
      setMessage(err?.response?.data?.message || "❌ Error marking attendance.");
    }
  };

  if (!user || user.role !== "employee") {
    return <div className="p-6 text-center">Unauthorized</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-sky-50 px-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Mark Attendance</h1>

        {message && (
          <div className="mb-4 p-2 text-center rounded text-sm text-green-700 bg-green-100">
            {message}
          </div>
        )}

        {!alreadyMarked && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Date Picker */}
            <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Select Date</label>
                <input
                 type="date"
                 value={selectedDate.toISOString().split("T")[0]}
                 onChange={(e) => setSelectedDate(new Date(e.target.value))}
                 className="w-full border rounded px-3 py-2"
                />
            </div>

            {/* Status Dropdown */}
            <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-400"
                required
            >
                <option value="office">Working from Office</option>
                <option value="home">Working from Home</option>
                <option value="leave">On Leave</option>
            </select>

            <button
                type="submit"
                className="w-full bg-sky-600 text-white py-2 rounded-md font-semibold hover:bg-sky-700 transition"
            >
                Submit Attendance
            </button>
          </form>

        )}
      </div>
    </div>
  );
}
