const { StatusCodes } = require("http-status-codes");
const User = require("../model/User");

const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "username and password are required" });
  }

  const foundMatch = await User.findOne({ username });
  if (!foundMatch) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "Invalid username" });
  }

  const isMatch = await foundMatch.comparePassword(password);
  if (!isMatch) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "Incorrect password" });
  }

  const roles = Object.values(foundMatch.roles).filter(Boolean);

  const accessToken = foundMatch.createAccessJWT(roles);
  const refreshToken = foundMatch.createRefreshJWT(roles);

  await User.updateOne({ _id: foundMatch._id }, { refreshToken });

  // Set short-lived token
  res.cookie("token", accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: 10 * 60 * 1000, // 10 min
  });

  // Set refresh token
  res.cookie("jwt", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });

  res.status(StatusCodes.OK).json({ roles });
};

const register = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "username and password are required" });
  }

  const duplicate = await User.findOne({ username });
  if (duplicate)
    return res
      .status(StatusCodes.CONFLICT)
      .json({ msg: "username already exists" });

  try {
    const user = await User.create({ ...req.body });
    res.status(StatusCodes.CREATED).json({ msg: "user Created" });
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST);
  }
};

const logout = (req, res) => {
  res.clearCookie("jwt", {
    httpOnly: true,
    sameSite: "None",
    secure: true,
  });
  res.status(200).json({ message: "Logged out successfully" });
};

module.exports = {
  login,
  register,
  logout,
};
