const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const AWS = require("aws-sdk");
const multer = require("multer");
const fs = require("fs");

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: "us-east-1",
});

// Setup Multer for file upload
const upload = multer({ dest: "uploads/" });

// Register User ---------------------------------------------------------------------
exports.register = async (req, res) => {
  try {
    const { fullName, email, password, profileType } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user)
      return res
        .status(400)
        .json({ success: false, message: "Email Already Exists." });

    user = new User({ fullName, email, password, profileType });
    await user.save();

    res
      .status(201)
      .json({ success: true, message: "User Registered Successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Login User ------------------------------------------------------------------------
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Email or Password." });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Email or Password." });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, profileType: user.profileType },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      success: true,
      message: "Login Successful.",
      data: {
        token,
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          profileType: user.profileType,
          profilePicture: user.profilePicture,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Profile Data ------------------------------------------------------------------
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User Not Found." });
    }

    res.status(200).json({
      success: true,
      message: "Profile Fetched Successfully.",
      data: user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update User Data ------------------------------------------------------------------
exports.updateProfile = [
  upload.single("profilePicture"),
  async (req, res) => {
    try {
      const { fullName, email, profileType } = req.body;
      let profilePicture = null;

      if (req.file) {
        // Read file from temporary storage
        const fileStream = fs.createReadStream(req.file.path);

        // S3 upload parameters
        const params = {
          Bucket: "rp-projects-public",
          Key: `profiles/${req.user.id}/${Date.now()}-${req.file.originalname}`,
          Body: fileStream,
          ContentType: req.file.mimetype,
        };

        // Upload to S3
        const s3Response = await s3.upload(params).promise();

        // Store the URL of the uploaded profile picture
        profilePicture = s3Response.Location;

        // Delete the temporary file from local storage
        fs.unlinkSync(req.file.path);
      }
      const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        { fullName, email, profileType, profilePicture },
        { new: true, runValidators: true }
      ).select("-password");

      if (!updatedUser) {
        return res
          .status(404)
          .json({ success: false, message: "User Not Found." });
      }

      res.status(200).json({
        success: true,
        message: "Profile Updated Successfully.",
        data: updatedUser,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
];

// Delete User Data ------------------------------------------------------------------
exports.deleteProfile = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.user.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User Not Found." });
    }

    res
      .status(200)
      .json({ success: true, message: "Profile Deleted Successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
