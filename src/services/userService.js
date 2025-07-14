const User = require("../model/User");

const getAllUsers = async () => {
  return await User.find();
};

const getUserByEmail = async (email) => {
  return await User.findOne({ email });
};

const upsertUser = async (userData) => {
  return await User.findOneAndUpdate(
    { email: userData.email },
    { $set: userData },
    { upsert: true, new: true },
  );
};

const updateUserByEmail = async (email, updateData) => {
  return await User.updateOne({ email }, { $set: updateData });
};

module.exports = {
  getAllUsers,
  getUserByEmail,
  upsertUser,
  updateUserByEmail,
};
