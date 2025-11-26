const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');
const passport = require('../config/passport');
const jwt = require('jsonwebtoken');

router.post('/register', registerUser);
router.post('/login', loginUser);

// Google OAuth routes
router.get('/google', 
    passport.authenticate('google', { 
        scope: ['profile', 'email'],
        session: false
    })
);

router.get('/google/callback',
    passport.authenticate('google', { 
        session: false,
        failureRedirect: `${process.env.FRONTEND_URL}/login?error=google_auth_failed`
    }),
    (req, res) => {
        try {
            // Generate JWT token
            const token = jwt.sign(
                { 
                    id: req.user.id,
                    email: req.user.email,
                    role: req.user.role
                },
                process.env.JWT_SECRET,
                { expiresIn: '30d' }
            );

            // Prepare user data
            const userData = {
                id: req.user.id,
                name: `${req.user.first_name} ${req.user.last_name}`,
                email: req.user.email,
                role: req.user.role,
                token: token
            };

            // Redirect to frontend with token in URL
            const redirectUrl = `${process.env.FRONTEND_URL}/auth/google/success?token=${token}&user=${encodeURIComponent(JSON.stringify(userData))}`;
            res.redirect(redirectUrl);
        } catch (error) {
            console.error('Google callback error:', error);
            res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
        }
    }
);

// --- MAKE SURE THIS LINE EXISTS ---
module.exports = router;