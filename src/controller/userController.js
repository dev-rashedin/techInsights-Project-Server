const userService = require("../services/userService");

// Example: Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.send(users);
  } catch (error) {
    res.status(500).send(error);
  }
};

// Example: Get user by email
const getUserByEmail = async (req, res) => {
  try {
    const email = req.params.email;
    const user = await userService.getUserByEmail(email);
    res.send(user);
  } catch (error) {
    res.status(500).send(error);
  }
};

// Example: Upsert user
const upsertUser = async (req, res) => {
  try {
    const userData = req.body;
    const user = await userService.upsertUser(userData);
    res.send(user);
  } catch (error) {
    res.status(500).send(error);
  }
};

// Example: Update user by email
const updateUserByEmail = async (req, res) => {
  try {
    const email = req.params.email;
    const updateData = req.body;
    const result = await userService.updateUserByEmail(email, updateData);
    res.send(result);
  } catch (error) {
    res.status(500).send(error);
  }
};

module.exports = {
  getAllUsers,
  getUserByEmail,
  upsertUser,
  updateUserByEmail,
};
