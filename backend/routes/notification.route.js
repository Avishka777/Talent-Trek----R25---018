const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notification.controller");
const authMiddleware = require("../middleware/authMiddleware");

// Get all notifications for authenticated user
router.get("/", authMiddleware, notificationController.getUserNotifications);

// Mark all notifications as read
router.patch("/mark-all-read", authMiddleware, notificationController.markAllAsRead);

// Mark single notification as read
router.patch("/:id/mark-read", authMiddleware, notificationController.markAsRead);

module.exports = router;