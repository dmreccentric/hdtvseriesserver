const jwt = require("jsonwebtoken");
const User = require("../model/User");

const verify = async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ msg: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_JWT_SECRET);

    // Check if the user still exists
    const foundUser = await User.findById(decoded.userId).exec();
    if (!foundUser) return res.status(401).json({ msg: "User not found" });

    // Return user info
    res.json({
      userId: foundUser._id,
      username: foundUser.username,
      roles: foundUser.roles,
    });
  } catch (err) {
    return res.status(401).json({ msg: "Invalid or expired token" });
  }
};

module.exports = { verify };
