const express = require("express");
const router = express.Router();
const Ticket = require("../models/Ticket");
const { verifyToken, verifyAgentOrAdmin } = require("./middleware/auth"); // ✅ updated
// const categorizeTicket = require("../utils/categorizeTicket");
// const { categorizeTicket } = require("../utils/ai");
// const authMiddleware = require("./middleware/auth");
// const { verifyToken } = require("../middleware/auth");

console.log("📡 tickets.js loaded");

// ✅ Create a new ticket (user only)
router.post("/", verifyToken, async (req, res) => {
  try {
    // const { title, description } = req.body;

    const { title, description, category = "General" } = req.body;

    const ticket = new Ticket({
      title,
      description,
      createdBy: req.user.username,
      status: "Pending",
      category, 
    });

    await ticket.save();
    res.status(201).json(ticket);
  } catch (err) {
    console.error("❌ Error creating ticket:", err);
    res.status(500).json({ msg: "Error creating ticket" });
  }
});


// ✅ Get tickets (admin/agent gets all, user gets own)
router.get("/", verifyToken, async (req, res) => {
  try {
    const { role, username } = req.user;

    const tickets =
      role === "admin" || role === "agent"
        ? await Ticket.find()
        : await Ticket.find({ createdBy: username });

    res.json(tickets);
  } catch (err) {
    console.error("❌ Fetch tickets error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ✅ Update ticket status (agent/admin only)
router.put("/:id/status", verifyToken, verifyAgentOrAdmin, async (req, res) => {
  const { status } = req.body;

  if (!["Pending", "In Progress", "Resolved"].includes(status)) {
    return res.status(400).json({ msg: "Invalid status" });
  }

  try {
    const updated = await Ticket.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!updated) return res.status(404).json({ msg: "Ticket not found" });
    res.json(updated);
  } catch (err) {
    console.error("❌ Status update error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ✅ COMMENTS ROUTE
router.post("/:id/comments", verifyToken, async (req, res) => {
  const { text } = req.body;

  if (!text || !text.trim()) {
    return res.status(400).json({ msg: "Comment cannot be empty" });
  }

  const commentObj = {
    text: text.trim(),
    commentedBy: req.user.username,
    createdAt: new Date(),
  };

  console.log("🧪 req.user:", req.user);
  console.log("🧪 commentObj:", commentObj);

  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ msg: "Ticket not found" });

    ticket.comments = ticket.comments.filter(c => c.text && c.commentedBy);
    ticket.comments.push(commentObj);

    console.log("✅ Pushed comment:", ticket.comments);

    await ticket.save();

    res.json({ msg: "✅ Comment added" });
  } catch (err) {
    console.error("🔥 Backend error while adding comment:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

module.exports = router;
