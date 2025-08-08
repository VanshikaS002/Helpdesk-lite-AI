import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard"; // ✅ This must be correct
import AdminUserManagement from "./pages/AdminUserManagement";

function App() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role"); // ✅ get role here

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={token ? <Dashboard /> : <Navigate to="/login" />} />

        {token && role === "admin" && (
          <Route path="/admin/users" element={<AdminUserManagement />} />
        )}

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
