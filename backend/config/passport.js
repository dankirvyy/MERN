const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findByPk(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Check if user already exists with this Google ID
                let user = await User.findOne({
                    where: { google_id: profile.id }
                });

                if (user) {
                    // User exists, return user
                    return done(null, user);
                }

                // Check if user exists with this email
                const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
                
                if (email) {
                    user = await User.findOne({ where: { email } });
                    
                    if (user) {
                        // Update existing user with Google ID
                        await user.update({ google_id: profile.id });
                        return done(null, user);
                    }
                }

                // Create new user
                const newUser = await User.create({
                    google_id: profile.id,
                    first_name: profile.name.givenName || 'User',
                    last_name: profile.name.familyName || '',
                    email: email,
                    role: 'user',
                    // Google users don't have passwords
                    password: null
                });

                done(null, newUser);
            } catch (error) {
                console.error('Google OAuth error:', error);
                done(error, null);
            }
        }
    )
);

module.exports = passport;
