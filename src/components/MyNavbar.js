import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function MyNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow px-4 py-3 flex justify-between items-center">
      <div className="text-xl font-bold text-sky-600">Attendance App</div>

      <div className="flex items-center gap-4">
        {user && (
          <>
            {user.role === "admin" && (
              <Link to="/dashboard" className="text-gray-700 hover:text-sky-600">Dashboard</Link>
            )}
            {user.role === "employee" && (
                <>   
                   <Link to="/attendance" className="text-gray-700 hover:text-sky-600">Mark Attendance</Link>
                   <Link to="/calendar" className="text-gray-700 hover:text-sky-600">My Calendar</Link>
                </>
              
            )}
            {user.role === "chef" && (
              <Link to="/chef-panel" className="text-gray-700 hover:text-sky-600">Chef Panel</Link>
            )}
            

            <span className="text-sm text-gray-500">({user.role})</span>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-3 py-1 text-sm rounded hover:bg-red-600"
            >
              Logout
            </button>
          </>
        )}

        {!user && (
          <>
            <Link to="/login" className="text-sky-600">Login</Link>
            <Link to="/register" className="text-sky-600">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
