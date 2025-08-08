function verifyAgentOrAdmin(req, res, next) {
  if (req.user && (req.user.role === "agent" || req.user.role === "admin")) {
    return next();
  } else {
    return res.status(403).json({ msg: "Access denied" });
  }
}

module.exports = { verifyAgentOrAdmin };