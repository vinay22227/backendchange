const express = require("express");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const User = require("../models/userModel");
const dotenv = require("dotenv");
 
dotenv.config();
 
const router = express.Router();
const otpStore = {}; // Store multiple OTPs for each user
const OTP_EXPIRATION_TIME = parseInt(process.env.OTP_EXPIRATION) || 5 * 60 * 1000; // Default 5 minutes
 
// Configure Nodemailer
const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});
 
// Generate a 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
 
/**
 * @route   POST /auth/forgot-password
 * @desc    Generate OTP and send to email
 */
router.post("/forgot-password", async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
 
    if (!user) return res.status(400).json({ message: "User not found" });
 
    const otp = generateOTP();
    const expiresAt = Date.now() + OTP_EXPIRATION_TIME;
 
    if (!otpStore[email]) otpStore[email] = []; // Initialize array if not present
 
    otpStore[email].push({ otp, expiresAt });
 
    console.log(`✅ OTP generated for ${email}: ${otp} (Expires at: ${new Date(expiresAt)})`); // Debugging log
 
    // Send OTP via Email
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Password Reset OTP",
            text: `Your OTP for password reset is ${otp}. It will expire in 5 minutes.`
        });
 
        res.json({ message: "OTP sent to email" });
    } catch (error) {
        res.status(500).json({ message: "Error sending email", error });
    }
});
 
/**
 * @route   POST /auth/verify-otp
 * @desc    Verify OTP
 */
router.post("/verify-otp", (req, res) => {
    const { email, otp } = req.body;
 
    if (!otpStore[email]) {
        console.log(`❌ No OTP found for ${email}`);
        return res.status(400).json({ message: "Invalid or expired OTP" });
    }
 
    // Filter out expired OTPs
    otpStore[email] = otpStore[email].filter(entry => Date.now() < entry.expiresAt);
 
    const validOtpIndex = otpStore[email].findIndex(entry => entry.otp === otp);
 
    if (validOtpIndex === -1) {
        console.log(`❌ Invalid OTP for ${email}`);
        return res.status(400).json({ message: "Invalid or expired OTP" });
    }
 
    console.log(`✅ OTP verified successfully for ${email}`);
    res.json({ message: "OTP verified successfully" });
});
 
/**
 * @route   POST /auth/reset-password
 * @desc    Reset user password
 */
router.post("/reset-password", async (req, res) => {
    const { email, otp, newPassword } = req.body;
 
    if (!otpStore[email]) {
        console.log(`❌ No OTP found for ${email}`);
        return res.status(400).json({ message: "Invalid or expired OTP" });
    }
 
    // Filter out expired OTPs
    otpStore[email] = otpStore[email].filter(entry => Date.now() < entry.expiresAt);
 
    const otpIndex = otpStore[email].findIndex(entry => entry.otp === otp);
 
    if (otpIndex === -1) {
        console.log(`❌ Invalid OTP for ${email}`);
        return res.status(400).json({ message: "Invalid or expired OTP" });
    }
 
    // Remove the used OTP from storage
    otpStore[email].splice(otpIndex, 1);
 
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findOneAndUpdate({ email }, { password: hashedPassword });
 
    console.log(`✅ Password reset successful for ${email}`);
    res.json({ message: "Password reset successful" });
});
 // const express = require('express');
// const { registerUser, loginUser } = require('../controllers/authController');
 
// const router = express.Router();
 
// router.post('/register', registerUser);
// router.post('/login', loginUser);
 
// module.exports = router;
module.exports = router;