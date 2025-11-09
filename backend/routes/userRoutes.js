const express = require('express');
const router = express.Router();
const { getUserProfile, updateUserProfile, updateUserAvatar } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

// --- Multer Configuration ---

// 1. Define storage settings
const storage = multer.diskStorage({
    destination: './public/uploads/avatars/', // Folder to save avatars
    filename: function (req, file, cb) {
        // Create a unique filename: user-ID-timestamp.ext
        const filename = `user-${req.user.id}-${Date.now()}${path.extname(file.originalname)}`;
        cb(null, filename);
    }
});

// 2. Define file filter (to match your PHP)
function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        // This error message matches your PHP file
        cb(new Error('Upload Error: Images Only! (JPG, PNG, GIF)'), false);
    }
}

// 3. Initialize multer upload middleware
const upload = multer({
    storage: storage,
    limits: { fileSize: 2000000 }, // 2MB limit
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
});
// --- End Multer Configuration ---


// --- User Routes ---
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);

// --- New Avatar Upload Route ---
router.post(
    '/avatar',
    protect, // 1. User must be logged in
    (req, res, next) => { // 2. Custom middleware to handle multer errors
        upload.single('avatar')(req, res, function (err) {
            if (err) {
                // Catches file type or size errors
                return res.status(400).json({ message: err.message });
            }
            next();
        });
    },
    updateUserAvatar // 3. If upload is ok, run the controller
);

module.exports = router;