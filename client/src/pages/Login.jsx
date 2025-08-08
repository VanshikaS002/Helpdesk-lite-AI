import React, { useState } from 'react';
import '../styles/Login.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {
  const [form, setForm] = useState({ username: '', password: '' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', form.username);
        localStorage.setItem('role', data.role);

        toast.success('✅ Login successful! Redirecting...', {
          onClose: () => {
            window.location.href = '/dashboard';
          },
          autoClose: 2000,
        });
      } else {
        toast.error(`❌ ${data.msg || 'Login failed'}`);
      }
    } catch (err) {
      toast.error('❌ Server error');
      console.error(err);
    }
  };

  return (
    <div className="login-background">
      <div className="login-container">
        <h2 className="login-title">Welcome Back 👋</h2>
        <form className="login-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <button type="submit">Login</button>
        </form>
        <p className="login-footer">
          Don't have an account? <a href="/register">Register</a>
        </p>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default Login;
