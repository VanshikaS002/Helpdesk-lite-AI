const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { verifyToken, verifyAgentOrAdmin } = require("./middleware/auth");

// ✅ Update role (admin only)
router.put("/:id/role", verifyToken, verifyAgentOrAdmin, async (req, res) => {
  const { role } = req.body;

  if (!["user", "agent", "admin"].includes(role)) {
    return res.status(400).json({ msg: "Invalid role" });
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.json(updatedUser);
  } catch (err) {
    console.error("❌ Role update error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;