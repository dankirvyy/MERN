const User = require('../models/User'); 
const VerificationCode = require('../models/VerificationCode');
const jwt = require('jsonwebtoken');
const { sendVerificationCode, sendPasswordResetCode } = require('../utils/emailService');
const { Op } = require('sequelize');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// Generate random 6-digit code
const generateCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// @desc    Register a new user
// @route   POST /api/auth/register
exports.registerUser = async (req, res) => {
    try {
        const { first_name, last_name, email, password } = req.body;

        const userExists = await User.findOne({ where: { email: email } });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            first_name,
            last_name,
            email,
            password,
        });

        res.status(201).json({
            _id: user.id,
            name: `${user.first_name} ${user.last_name}`, 
            email: user.email,
            role: user.role, // Added role
            avatar_filename: user.avatar_filename, // Added
            phone_number: user.phone_number,   // <-- ADDED THIS LINE
            token: generateToken(user.id),
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Authenticate (login) a user
// @route   POST /api/auth/login
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ 
            where: { email: email },
            attributes: ['id', 'first_name', 'last_name', 'email', 'password', 'role', 'avatar_filename', 'phone_number', 'is_suspended']
        });

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        if (user.is_suspended) {
            return res.status(403).json({ message: 'Your account has been suspended. Please contact support for assistance.' });
        }

        if (await user.matchPassword(password)) {
            res.json({
                _id: user.id,
                name: `${user.first_name} ${user.last_name}`,
                email: user.email,
                role: user.role, // Added role
                avatar_filename: user.avatar_filename, 
                phone_number: user.phone_number,
                token: generateToken(user.id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Send verification code for signup
// @route   POST /api/auth/send-verification
exports.sendSignupVerification = async (req, res) => {
    try {
        const { email, first_name, last_name } = req.body;

        if (!email || !first_name || !last_name) {
            return res.status(400).json({ message: 'Email and name are required' });
        }

        // Check if user already exists
        const userExists = await User.findOne({ where: { email } });
        if (userExists) {
            return res.status(400).json({ message: 'This email is already registered' });
        }

        // Generate verification code
        const code = generateCode();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Delete any existing unused codes for this email
        await VerificationCode.destroy({
            where: { email, type: 'signup', used: false }
        });

        // Store verification code
        await VerificationCode.create({
            email,
            code,
            type: 'signup',
            expires_at: expiresAt
        });

        // Send email
        const sent = await sendVerificationCode(email, `${first_name} ${last_name}`, code);

        if (sent) {
            res.json({ message: 'Verification code sent to your email' });
        } else {
            res.status(500).json({ message: 'Failed to send verification email' });
        }
    } catch (error) {
        console.error('Send verification error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Verify code and register user
// @route   POST /api/auth/verify-and-register
exports.verifyAndRegister = async (req, res) => {
    try {
        const { email, code, first_name, last_name, password } = req.body;

        // Find valid verification code
        const verificationRecord = await VerificationCode.findOne({
            where: {
                email,
                code,
                type: 'signup',
                used: false,
                expires_at: { [Op.gt]: new Date() }
            }
        });

        if (!verificationRecord) {
            return res.status(400).json({ message: 'Invalid or expired verification code' });
        }

        // Check if user already exists
        const userExists = await User.findOne({ where: { email } });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create user
        const user = await User.create({
            first_name,
            last_name,
            email,
            password
        });

        // Mark code as used
        verificationRecord.used = true;
        await verificationRecord.save();

        res.status(201).json({
            _id: user.id,
            name: `${user.first_name} ${user.last_name}`,
            email: user.email,
            role: user.role,
            avatar_filename: user.avatar_filename,
            phone_number: user.phone_number,
            token: generateToken(user.id)
        });
    } catch (error) {
        console.error('Verify and register error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Send password reset code
// @route   POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        // Check if user exists
        const user = await User.findOne({ where: { email } });
        if (!user) {
            // Don't reveal that user doesn't exist for security
            return res.json({ message: 'If an account exists with this email, a password reset code has been sent' });
        }

        // Generate reset code
        const code = generateCode();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Delete any existing unused codes for this email
        await VerificationCode.destroy({
            where: { email, type: 'password_reset', used: false }
        });

        // Store reset code
        await VerificationCode.create({
            email,
            code,
            type: 'password_reset',
            expires_at: expiresAt
        });

        // Send email
        const sent = await sendPasswordResetCode(email, `${user.first_name} ${user.last_name}`, code);

        if (sent) {
            res.json({ message: 'Password reset code sent to your email' });
        } else {
            res.status(500).json({ message: 'Failed to send reset email' });
        }
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Verify reset code
// @route   POST /api/auth/verify-reset-code
exports.verifyResetCode = async (req, res) => {
    try {
        const { email, code } = req.body;

        const verificationRecord = await VerificationCode.findOne({
            where: {
                email,
                code,
                type: 'password_reset',
                used: false,
                expires_at: { [Op.gt]: new Date() }
            }
        });

        if (!verificationRecord) {
            return res.status(400).json({ message: 'Invalid or expired verification code' });
        }

        res.json({ message: 'Code verified successfully' });
    } catch (error) {
        console.error('Verify reset code error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Reset password with code
// @route   POST /api/auth/reset-password
exports.resetPassword = async (req, res) => {
    try {
        const { email, code, newPassword } = req.body;

        // Find valid verification code
        const verificationRecord = await VerificationCode.findOne({
            where: {
                email,
                code,
                type: 'password_reset',
                used: false,
                expires_at: { [Op.gt]: new Date() }
            }
        });

        if (!verificationRecord) {
            return res.status(400).json({ message: 'Invalid or expired verification code' });
        }

        // Find user
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update password - set and mark as changed to trigger beforeUpdate hook
        user.set('password', newPassword);
        user.changed('password', true);
        await user.save();

        console.log('Password reset for user:', email);

        // Mark code as used
        verificationRecord.used = true;
        await verificationRecord.save();

        res.json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};