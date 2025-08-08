const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  text: { type: String, required: true },
  commentedBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const ticketSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  createdBy: { type: String, required: true },
  status: {
    type: String,
    enum: ["Pending", "In Progress", "Resolved"],
    default: "Pending"
  },
  category: { type: String, default: "General" },
  comments: [commentSchema]
}, { timestamps: true });

console.log("📦 Ticket model loaded/reloaded");
const Ticket = mongoose.models.Ticket || mongoose.model("Ticket", ticketSchema);
module.exports = Ticket;
