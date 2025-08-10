const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const userController = require("../controllers/user.controller");

// Register User
router.post("/register", userController.register);

// Login User
router.post("/login", userController.login);

// Get User Profile
router.get("/profile", authMiddleware, userController.getProfile);

// Update User Profile
router.put("/profile", authMiddleware, userController.updateProfile);

// Delete User Profile
router.delete("/profile", authMiddleware, userController.deleteProfile);

module.exports = router;
