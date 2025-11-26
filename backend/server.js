require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('./config/passport');
const { sequelize, connectDB } = require('./config/db');
const path = require('path'); // <-- 1. IMPORT THE 'path' MODULE
const { autoCleanupExpiredBookings } = require('./utils/bookingUtils');

// --- Set Timezone (Philippines) ---
process.env.TZ = 'Asia/Manila';

// --- Database Connection ---
connectDB();
sequelize.sync(); 

// --- App Initialization ---
const app = express();

// --- Middlewares ---
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());

// Session configuration for passport
app.use(session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
    }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

// --- 2. SERVE STATIC FILES ---
// This line tells Express that any request starting with '/uploads'
// should be served from the 'backend/public/uploads' folder.
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// --- Auto-cleanup expired bookings (runs every hour) ---
setInterval(autoCleanupExpiredBookings, 60 * 60 * 1000); // Every hour
autoCleanupExpiredBookings(); // Run once on startup

// --- API Routes ---
app.use('/api/admin', require('./routes/adminRoutes')); // Admin routes FIRST
app.use('/api/frontdesk', require('./routes/frontDeskRoutes')); // Front Desk routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tours', require('./routes/tours')); 
app.use('/api/room-types', require('./routes/roomTypes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/users', require('./routes/userRoutes'));


// --- Start Server ---
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});