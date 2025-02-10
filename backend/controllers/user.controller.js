const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const register = async (req, res) => {
    try {
        const { fullName, email, password, profileType } = req.body;

        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: "Email already exists" });

        user = new User({ fullName, email, password, profileType });
        await user.save();

        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid email or password" });

        // Validate password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

        // Generate JWT token
        const token = jwt.sign({ id: user._id, profileType: user.profileType }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });

        res.status(200).json({ token, user: { id: user._id, fullName: user.fullName, email: user.email, profileType: user.profileType } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { register, login };
