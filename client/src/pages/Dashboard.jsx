import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import "../styles/Dashboard.css";
import { useChatbot } from "../context/ChatbotContext";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const faq = {
  "how to submit a ticket": "Go to the dashboard, click 'Submit Ticket', fill the form, and click submit.",
  "how do i log in": "Go to the login page and enter your credentials.",
  "how do i register": "Visit the register page, fill in your details and role.",
  "where can i view submitted tickets": "Click 'Show Previous Tickets' to view them in a table.",
  "how does the chatbot work": "It answers only predefined project-related questions.",
  "who can use this project": "Users, agents, and admins can use this helpdesk system.",
};

function Dashboard() {
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const [token, setToken] = useState("");
  const [title, setTitle] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [category, setCategory] = useState("General");
  const [description, setDescription] = useState("");
  const [tickets, setTickets] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi! How can I help you today?" },
  ]);
  const [commentInputs, setCommentInputs] = useState({});
  const [showPopup, setShowPopup] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [searchText, setSearchText] = useState("");

  const navigate = useNavigate();
  const { isOpen, setIsOpen } = useChatbot();
  const showChatbot = isOpen;

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUsername = localStorage.getItem("username");
    const storedRole = localStorage.getItem("role");

    if (!storedToken) {
      navigate("/login");
      return;
    }

    setToken(storedToken);
    setUsername(storedUsername);
    setRole(storedRole);
    loadTickets(storedToken);
  }, []);

  const openTicketDetails = (ticket) => {
    setSelectedTicket(ticket);
    setCommentText("");
  };

  const sendMessage = async () => {
  if (!chatInput.trim()) return;

  const userMsg = { from: "user", text: chatInput };
  setMessages((prev) => [...prev, userMsg]);
  setChatInput("");

  try {
    const res = await fetch("http://localhost:8000/ask-ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: chatInput }),
    });

    const data = await res.json();

    if (data.reply) {
      const botReply = { from: "bot", text: data.reply };
      setMessages((prev) => [...prev, botReply]);
    } else {
      const errorReply = { from: "bot", text: "⚠️ " + (data.error || "Something went wrong.") };
      setMessages((prev) => [...prev, errorReply]);
    }
  } catch (err) {
    const errorReply = { from: "bot", text: "⚠️ Network error. Try again later." };
    setMessages((prev) => [...prev, errorReply]);
    console.error("AI fetch error:", err);
  }
};

  const loadTickets = async (authToken) => {
    try {
      const res = await fetch("/api/tickets", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();
      setTickets(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load tickets:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, description, category }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("✅ Ticket submitted!");
        setTitle("");
        setDescription("");
        setShowPopup(false);
        loadTickets(token);
      } else {
        alert("❌ " + data.msg);
      }
    } catch (err) {
      console.error("❌ Ticket error:", err);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(`/api/tickets/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        loadTickets(token);
      } else {
        const err = await res.json();
        alert(err.msg);
      }
    } catch (err) {
      console.error("Status update error:", err);
    }
  };

  const submitPopupComment = async (ticketId) => {
    if (!commentText?.trim()) return;
    try {
      const res = await fetch(`/api/tickets/${ticketId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: commentText }),
      });
      if (res.ok) {
        loadTickets(token);
        setCommentText("");
        setSelectedTicket(null);
      } else {
        const data = await res.json();
        alert("❌ " + data.msg);
      }
    } catch (err) {
      console.error("❌ Popup comment error:", err);
    }
  };

  // const getChatbotReply = (input) => {
  //   const lower = input.toLowerCase().trim();
  //   for (const key in faq) {
  //     if (lower.includes(key)) return faq[key];
  //   }
  //   return "I'm here to help with project-related queries. Please try rephrasing.";
  // };

  const handleChatInput = (e) => {
  if (e.key === "Enter" && chatInput.trim()) {
    sendMessage();
  }
};

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const visibleTickets =
    role === "agent" || role === "admin"
      ? tickets
      : tickets.filter((ticket) => ticket.createdBy === username);

  const stats = {
    total: visibleTickets.length,
    pending: visibleTickets.filter((t) => t.status === "Pending").length,
    inProgress: visibleTickets.filter((t) => t.status === "In Progress").length,
    resolved: visibleTickets.filter((t) => t.status === "Resolved").length,
  };

  const filteredTickets = visibleTickets
    .filter((t) => (statusFilter ? t.status === statusFilter : true))
    .filter((t) => t.title.toLowerCase().includes(searchText.toLowerCase()))
    .sort((a, b) =>
      sortOrder === "newest"
        ? new Date(b.createdAt) - new Date(a.createdAt)
        : new Date(a.createdAt) - new Date(b.createdAt)
    );

  const chartData = {
    labels: ["Pending", "In Progress", "Resolved"],
    datasets: [
      {
        label: "Tickets",
        data: [stats.pending, stats.inProgress, stats.resolved],
        backgroundColor: ["#f39c12", "#3498db", "#2ecc71"],
      },
    ],
  };

  return (
    <div className={`dashboard ${showChatbot ? "chatbot-open" : ""}`}>
      <div className="dashboard-header">
        <h2 className="left-align">Welcome, {username} 👋</h2>
        <button className="logout-button" onClick={logout}>
          Logout
        </button>
      </div>

      <div className="top-buttons">
        {role === "admin" && (
          <button className="manage-users-button" onClick={() => navigate("/admin/users")}>
            👥 Manage Users
          </button>
        )}
        {role === "user" && (
          <button className="open-popup-button" onClick={() => setShowPopup(true)}>
            ➕ Submit a Ticket
          </button>
        )}
      </div>

      <div className="chart-container">
  <Bar data={chartData} />
</div>

<button
  className="toggle-filters-button"
  onClick={() => setShowFilters(!showFilters)}
>
  {showFilters ? "Hide Filters" : "Show Filters"}
</button>

{/* 🔎 Filters Bar */}
{showFilters && (
<div className="filters-bar">
  <input
    type="text"
    placeholder="Search by title..."
    value={searchText}
    onChange={(e) => setSearchText(e.target.value)}
  />
  <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
    <option value="">All</option>
    <option value="Pending">Pending</option>
    <option value="In Progress">In Progress</option>
    <option value="Resolved">Resolved</option>
  </select>
  <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
    <option value="newest" disabled>Sort</option>
    <option value="newest">Newest First</option>
    <option value="oldest">Oldest First</option>
  </select>
</div>
)}
      <table className="ticket-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Category</th>
            <th>Status</th>
            {role !== "user" && <th>Status</th>}
          </tr>
        </thead>
        <tbody>
          {filteredTickets.map((ticket) => (
            <tr
              key={ticket._id}
              onClick={() => openTicketDetails(ticket)}
              className="clickable-row"
            >
              <td>{ticket.title}</td>
              <td>{ticket.category}</td>
              <td>{ticket.status}</td>
              {role !== "user" && (
                <td onClick={(e) => e.stopPropagation()} className="action-dropdown-cell">
  <div className="dropdown-wrapper">
    <button className="status-badge">
      {ticket.status}    🔽
    </button>
    <div className="dropdown-menu">
      {["Pending", "In Progress", "Resolved"].map((option) => (
        <div
          key={option}
          className={`dropdown-item ${ticket.status === option ? "active" : ""}`}
          onClick={() => updateStatus(ticket._id, option)}
        >
          {option}
        </div>
      ))}
    </div>
  </div>
</td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-form">
            <button className="close-popup" onClick={() => setShowPopup(false)}>
              ❌
            </button>
            <h3>Submit a New Ticket</h3>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title"
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description"
              />
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="General">General</option>
                <option value="Technical">Technical</option>
                <option value="Billing">Billing</option>
              </select>
              <button type="submit">Submit</button>
            </form>
          </div>
        </div>
      )}

      {selectedTicket && (
        <div className="popup-overlay">
          <div className="popup-form">
            <button className="close-popup" onClick={() => setSelectedTicket(null)}>
              ❌
            </button>
            <h3>Ticket Details</h3>
            <p><strong>Title:</strong> {selectedTicket.title}</p>
            <p><strong>Description:</strong> {selectedTicket.description}</p>
            {/* <p><strong>Created By:</strong> {selectedTicket.createdBy}</p>
            <p><strong>Created At:</strong> {new Date(selectedTicket.createdAt).toLocaleString()}</p> */}
            {(role === "admin" || role === "agent") && (
              <>
            <p><strong>Created By:</strong> {selectedTicket.createdBy}</p>
            <p><strong>Created At:</strong> {new Date(selectedTicket.createdAt).toLocaleString()}</p>
            <h4>Comments</h4>
            {selectedTicket.comments && selectedTicket.comments.length > 0 ? (
              <ul className="comment-list">
                {selectedTicket.comments.map((c, idx) => (
                  <li key={idx}>
                    <strong>{c.commentedBy || "Unknown"}:</strong> {c.text} <br />
                    <small>{new Date(c.timestamp || c.date || c.createdAt).toLocaleString()}</small>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No comments yet.</p>
            )}
                <textarea
                  placeholder="Add comment"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
                <button onClick={() => submitPopupComment(selectedTicket._id)}>
                  Add Comment
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Chatbot Panel */}
      {role === "user" && (
      <div className={`chatbot-panel ${showChatbot ? "open" : ""}`}>
        <div className="chat-header">
          Chatbot
          <button onClick={() => setIsOpen(false)}>×</button>
        </div>
        <div className="chat-body">
          {messages.map((msg, i) => (
            <div key={i} className={`message ${msg.from}`}>
              {msg.text}
            </div>
          ))}
        </div>
        <div className="chat-input-wrapper">
          <input
            type="text"
            placeholder="Type your question..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={handleChatInput}
          />
          <button className="send-btn" onClick={sendMessage}>
            ➤
          </button>
        </div>
      </div>
      )}

      {/* Floating Chatbot Toggle */}
      
      {role === "user" && !isOpen && (
      <button className="chatbot-toggle" onClick={() => setIsOpen(true)}>
        <img
          src="/chb.png" 
          alt="Chatbot"
          className="chatbot-icon"
        />
      </button>
      )}
    </div>
  );
}

export default Dashboard;
