const User = require('../models/User'); // This is your 'guests' model
const { Op } = require('sequelize'); // Import Sequelize's Operator

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getUserProfile = async (req, res) => {
    // req.user is added by our 'protect' middleware
    res.json(req.user);
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateUserProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);

        if (user) {
            // --- UPDATED LOGIC ---
            // Check if email is being changed and if it's already in use
            if (req.body.email && req.body.email !== user.email) {
                const emailExists = await User.findOne({
                    where: {
                        email: req.body.email,
                        id: { [Op.ne]: user.id } // 'ne' means "not equal to"
                    }
                });
                if (emailExists) {
                    return res.status(400).json({ message: 'Email is already in use' });
                }
                user.email = req.body.email;
            }
            // --- END UPDATED LOGIC ---

            user.first_name = req.body.first_name || user.first_name;
            user.last_name = req.body.last_name || user.last_name;
            user.phone_number = req.body.phone_number || user.phone_number;
            
            const updatedUser = await user.save();

            // Send back the updated user data
            res.json({
                _id: updatedUser.id,
                name: `${updatedUser.first_name} ${updatedUser.last_name}`,
                email: updatedUser.email, // Now sends the new email
                avatar_filename: updatedUser.avatar_filename,
                phone_number: updatedUser.phone_number,
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.updateUserAvatar = async (req, res) => {
    try {
        // req.file is added by the 'multer' middleware
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded.' });
        }

        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // TODO: In a production app, you would delete the old file
        // e.g., fs.unlink(`public/uploads/avatars/${user.avatar_filename}`)

        // Update the database with the new filename
        user.avatar_filename = req.file.filename;
        await user.save();

        // Send back the fully updated user data
        res.json({
            _id: user.id,
            name: `${user.first_name} ${user.last_name}`,
            email: user.email,
            avatar_filename: user.avatar_filename, // The new filename
            phone_number: user.phone_number,
        });

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};