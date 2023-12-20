const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};
// Hash token
const hashToken = (token) => {
  return crypto.createHash("sha256").update(token.toString()).digest("hex"); // token data type is not string then there may be error so covernt to string
};

module.exports = {
  generateToken,
  hashToken,
};
