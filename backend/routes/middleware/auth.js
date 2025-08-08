const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ msg: "Missing or invalid token" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // ✅ this must include `username`
    next();
  } catch (err) {
    return res.status(403).json({ msg: "Invalid token" });
  }
}

const verifyAgentOrAdmin = (req, res, next) => {
  const { role } = req.user;
  if (role === "admin" || role === "agent") {
    next();
  } else {
    return res.status(403).json({ msg: "Access denied: Admins or Agents only" });
  }
};


module.exports = {
  verifyToken,
  verifyAgentOrAdmin,
};

