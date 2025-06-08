import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ChefPanel from "./pages/ChefPanel";
import AttendanceForm from "./pages/AttendanceForm";
import MyNavbar from "./components/MyNavbar";
import PrivateRoute from "./components/PrivateRoute";
import EmployeeCalendar from "./pages/EmployeeCalendar";

function App() {
  return (
    <Router>
      <MyNavbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <Dashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/attendance"
          element={
            <PrivateRoute allowedRoles={["employee"]}>
              <AttendanceForm />
            </PrivateRoute>
          }
        />

        <Route
          path="/chef-panel"
          element={
            <PrivateRoute allowedRoles={["chef"]}>
              <ChefPanel />
            </PrivateRoute>
          }
        />
        <Route
          path="/calendar"
          element={
            <PrivateRoute allowedRoles={["employee"]}>
              <EmployeeCalendar />
            </PrivateRoute>
          }
        />

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<div className="p-6 text-center text-gray-400">404 - Not Found</div>} />
      </Routes>
    </Router>
  );
}

export default App;
