const User = require("../model/User");
const jwt = require("jsonwebtoken");

const refresh = async (req, res) => {
  const refreshToken = req.cookies.jwt;
  if (!refreshToken) return res.status(401).json({ msg: "No refresh token" });

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_JWT_SECRET);

    // Find the user in DB
    const foundUser = await User.findById(decoded.userId).exec();
    if (!foundUser) return res.status(403).json({ msg: "User not found" });

    // Create a new access token using instance method
    const accessToken = foundUser.createAccessJWT(foundUser.roles);

    // Set the new access token cookie
    res.cookie("token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 min
    });

    res.json({ msg: "Access token refreshed" });
  } catch (err) {
    return res.status(403).json({ msg: "Invalid refresh token" });
  }
};

module.exports = { refresh };
