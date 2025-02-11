const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const userController = require("../controllers/user.controller");
const router = express.Router();

router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/profile", authMiddleware, userController.getProfile);
router.put("/profile", authMiddleware, userController.updateProfile);
router.delete("/profile", authMiddleware, userController.deleteProfile);

module.exports = router;
