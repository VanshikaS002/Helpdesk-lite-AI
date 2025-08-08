const express = require("express");
const router = express.Router();
const User = require("../models/User");

// ✅ Import middleware
const verifyToken = require("./middleware/auth").verifyToken;
const { verifyAgentOrAdmin } = require("./middleware/roleMiddleware");

// ✅ GET all users (Admin/Agent access only)
router.get("/users", verifyToken, verifyAgentOrAdmin, async (req, res) => {
  try {
    const users = await User.find({}, "-password"); // Exclude password field
    res.json(users);
  } catch (err) {
    console.error("❌ Error fetching users:", err);
    res.status(500).json({ msg: "Server error while fetching users" });
  }
});

// ✅ PUT - Promote/demote user role (Admin/Agent)
router.put("/users/:id/role", verifyToken, verifyAgentOrAdmin, async (req, res) => {
  const { role } = req.body;

  if (!["user", "agent"].includes(role)) {
    return res.status(400).json({ msg: "❌ Invalid role" });
  }

  try {
    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    );

    if (!updated) return res.status(404).json({ msg: "User not found" });

    res.json(updated);
  } catch (err) {
    console.error("❌ Error updating user role:", err);
    res.status(500).json({ msg: "Server error while updating role" });
  }
});

// ✅ DELETE - Remove a user (Admin/Agent)
router.delete("/users/:id", verifyToken, verifyAgentOrAdmin, async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ msg: "User not found" });

    res.json({ msg: "✅ User deleted" });
  } catch (err) {
    console.error("❌ Error deleting user:", err);
    res.status(500).json({ msg: "Server error while deleting user" });
  }
});

module.exports = router;