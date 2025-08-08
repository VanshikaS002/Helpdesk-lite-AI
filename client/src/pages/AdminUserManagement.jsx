import React, { useEffect, useState } from "react";
import "../styles/AdminUserManagement.css";
import { useNavigate } from "react-router-dom";

function AdminUserManagement() {
  const [users, setUsers] = useState([]);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedNewRole, setSelectedNewRole] = useState("");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      alert("You must be logged in as admin or agent to view this page.");
      return;
    }

    fetch("/api/admin/users", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => console.error("Error fetching users:", err));
  }, []);

  const confirmRoleChange = (id, newRole) => {
    setSelectedUserId(id);
    setSelectedNewRole(newRole);
    setShowConfirmPopup(true);
  };

  const handleConfirmChange = () => {
    fetch(`/api/users/${selectedUserId}/role`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ role: selectedNewRole }),
    })
      .then((res) => res.json())
      .then((updated) => {
        if (updated._id) {
          alert(`✅ Role updated to ${updated.role}`);
          setUsers((prev) =>
            prev.map((user) => (user._id === updated._id ? updated : user))
          );
        } else {
          alert(`❌ ${updated.msg || "Something went wrong"}`);
        }
        setShowConfirmPopup(false);
      })
      .catch((err) => {
        console.error("❌ Role update error:", err);
        alert("❌ Failed to update role");
        setShowConfirmPopup(false);
      });
  };

  const deleteUser = (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    fetch(`/api/admin/users/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then(() => {
        alert("✅ User deleted");
        setUsers((prev) => prev.filter((user) => user._id !== id));
      })
      .catch((err) => {
        console.error("❌ Delete user error:", err);
        alert("❌ Failed to delete user");
      });
  };

  return (
    <div className="dashboard-container">
      <button className="back-button" onClick={() => navigate(-1)}>❌</button>
      <h2>User Management</h2>

      <table className="user-table">
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>
                {user.role !== "admin" && (
                  <>
                    <button
                      className="make-agent"
                      onClick={() =>
                        confirmRoleChange(
                          user._id,
                          user.role === "user" ? "agent" : "user"
                        )
                      }
                    >
                      Make {user.role === "user" ? "Agent" : "User"}
                    </button>

                    <button
                      className="delete-user"
                      onClick={() => deleteUser(user._id)}
                    >
                      Delete
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ✅ Confirmation Popup */}
      {showConfirmPopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h2>⚠️ Confirm Role Change</h2>
            <p>Are you sure you want to change the role to <strong>{selectedNewRole}</strong>?</p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button onClick={handleConfirmChange}>✅ Confirm</button>
              <button onClick={() => setShowConfirmPopup(false)}>❌ Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUserManagement;
