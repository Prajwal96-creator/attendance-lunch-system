import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../api";

export default function ChefPanel() {
  const { user } = useAuth();
  const [presentCount, setPresentCount] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchToday = async () => {
      try {
        const res = await API.get("/attendance/today");
        const presentOnly = res.data.filter((a) => a.status === "present");
        setPresentCount(presentOnly.length);
      } catch (err) {
        console.error("Error fetching attendance for chef", err);
      } finally {
        setLoading(false);
      }
    };

    fetchToday();
  }, []);

  if (!user || user.role !== "chef") {
    return <div className="text-center p-6">Unauthorized</div>;
  }

  return (
    <div className="min-h-screen bg-amber-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-sm w-full text-center">
        <h1 className="text-2xl font-bold mb-4 text-amber-700">Chef Panel</h1>
        {loading ? (
          <p className="text-gray-500">Loading present count...</p>
        ) : (
          <div>
            <p className="text-lg text-gray-700 mb-2">
              Employees marked present today:
            </p>
            <div className="text-5xl font-bold text-green-600">{presentCount}</div>
          </div>
        )}
      </div>
    </div>
  );
}
