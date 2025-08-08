import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Register.css";

function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "user",
  });

  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setShowSuccessPopup(true); // 🎉 Show popup
      } else {
        alert("❌ " + (result.msg || "Registration failed"));
      }
    } catch (err) {
      console.error("❌ Register error:", err);
      alert("Server error. Please try again later.");
    }
  };

  return (
    <div className="register-background">
      <div className="register-container">
        <h2 className="register-title">Create an Account 🚀</h2>
        <form className="register-form" onSubmit={handleSubmit}>
          <input
            name="username"
            type="text"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <div className="select-wrapper">
          <select name="role" value={formData.role} onChange={handleChange}>
            <option value="user">User</option>
            <option value="agent">Agent</option>
            <option value="admin">Admin</option>
          </select>
          </div>
          <button type="submit">Register</button>
        </form>
        <p className="register-footer">
          Already have an account? <a href="/login">Login</a>
        </p>
      </div>

      {/* ✅ Popup on successful registration */}
      {showSuccessPopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h2>🎉 Congratulations!</h2>
            <p>You’ve registered successfully.</p>
            <button onClick={() => navigate("/login")}>Go to Login</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Register;
