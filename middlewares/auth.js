const jwt = require("jsonwebtoken");
const User = require("../model/User");

const verifyUser = async (req, res, next) => {
  let token = req.cookies?.token;

  // If no token, block access
  if (!token) return res.status(401).json({ msg: "No token provided" });

  try {
    // Try verifying access token
    const decoded = jwt.verify(token, process.env.ACCESS_JWT_SECRET);
    req.user = { userId: decoded.userId, roles: decoded.roles };
    return next();
  } catch (err) {
    // If token expired, try using refresh token
    if (err.name === "TokenExpiredError") {
      const refreshToken = req.cookies?.jwt;
      if (!refreshToken)
        return res.status(401).json({ msg: "Refresh token missing" });

      try {
        const decodedRefresh = jwt.verify(
          refreshToken,
          process.env.REFRESH_JWT_SECRET
        );

        // Check if user still exists
        const foundUser = await User.findById(decodedRefresh.userId).exec();
        if (!foundUser) return res.status(401).json({ msg: "User not found" });

        // Generate new access token
        const newAccessToken = foundUser.createAccessJWT(
          Object.values(foundUser.roles).filter(Boolean)
        );

        // Attach new access token in cookie
        res.cookie("token", newAccessToken, {
          httpOnly: true,
          secure: false,
          sameSite: "None",
          maxAge: 10 * 60 * 1000, // 10 minutes
        });

        req.user = { userId: foundUser._id, roles: foundUser.roles };
        return next();
      } catch (refreshErr) {
        return res.status(401).json({ msg: "Invalid refresh token" });
      }
    }

    // Other errors (invalid token, etc.)
    return res.status(401).json({ msg: "Invalid or expired token" });
  }
};

module.exports = { verifyUser };
