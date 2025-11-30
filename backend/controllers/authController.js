const User = require('../models/User'); 
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
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