const User = require("../model/User");

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password"); // exclude password
    res.status(200).json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error fetching users" });
  }
};

const getUserById = async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
};

const updateUser = async (req, res) => {
  try {
    const { username, roles, email } = req.body;

    if (!username || !email)
      return res
        .status(400)
        .json({ message: "Username and Email is required" });

    // Define allowed roles
    const ROLES_LIST = {
      Admin: 5150,
      Editor: 1984,
      User: 2001,
    };
    const validRoles = Object.values(ROLES_LIST);

    // Sanitize roles
    const sanitizedRoles = {};
    for (const [role, value] of Object.entries(roles || {})) {
      if (validRoles.includes(value)) {
        sanitizedRoles[role] = value;
      }
    }

    // Save to DB
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { username, roles: sanitizedRoles, email },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Server error updating user" });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
};
