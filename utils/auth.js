// authMiddleware.js
const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(401).json({ status: 401, message: "Token not provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.jwtSecret); // Verify JWT token with your secret key
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ status: 401, message: "Invalid token" });
  }
};
module.exports = { verifyToken };
