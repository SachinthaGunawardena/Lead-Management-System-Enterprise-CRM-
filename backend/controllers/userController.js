const User = require("../models/User");

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    res.json({
      message: "Profile data",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to load profile",
    });
  }
};

module.exports = {
  getProfile,
};
