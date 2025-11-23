const jwt = require('jsonwebtoken');
const User = require('../models/User'); // This is your 'guests' model

const protect = async (req, res, next) => {
    let token;

    // Check for token in the 'Authorization' header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header (e.g., "Bearer 12345...")
            token = req.headers.authorization.split(' ')[1];

            // Verify the token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from the ID in the token
            // We attach this user to the 'req' object
            req.user = await User.findByPk(decoded.id, {
                attributes: { exclude: ['password'] } // Don't return the password
            });

            if (!req.user) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            next(); // Move to the next function
        } catch (error) {
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// Admin only middleware
const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as admin' });
    }
};

// Front Desk only middleware
const frontDeskOnly = (req, res, next) => {
    if (req.user && req.user.role === 'front_desk') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized, front desk access only' });
    }
};

module.exports = { protect, admin, frontDeskOnly };