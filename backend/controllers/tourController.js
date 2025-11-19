const Tour = require('../models/Tour');
const { Op } = require('sequelize'); // 1. IMPORT Op FOR SEARCHING
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../public/uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'tour-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    },
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

exports.upload = upload;

// @desc    Fetch all active tours (WITH SEARCH & SORT)
// @route   GET /api/tours
exports.getAllTours = async (req, res) => {
    try {
        const { search, sort } = req.query; // 2. Get query params from URL

        // --- 3. Build Query Options ---
        let whereOptions = { is_active: 1 }; // Default to active tours
        let orderOptions = [];

        // Add search logic (if 'search' param exists)
        if (search) {
            whereOptions.name = {
                [Op.like]: `%${search}%` // SQL LIKE '%search_term%'
            };
        }

        // Add sort logic (based on 'sort' param)
        switch (sort) {
            case 'price_asc':
                orderOptions.push(['price', 'ASC']);
                break;
            case 'price_desc':
                orderOptions.push(['price', 'DESC']);
                break;
            case 'name_asc':
                orderOptions.push(['name', 'ASC']);
                break;
            default:
                // Default sort by newest created
                orderOptions.push(['created_at', 'DESC']);
        }
        // --- End Query Options ---

        // 4. Find all tours using the new options
        const tours = await Tour.findAll({
            where: whereOptions,
            order: orderOptions
        });
        
        res.json(tours);

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Fetch a single tour by ID
// @route   GET /api/tours/:id
exports.getTourById = async (req, res) => {
    try {
        const tour = await Tour.findByPk(req.params.id);

        if (tour) {
            res.json(tour);
        } else {
            res.status(404).json({ message: 'Tour not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// --- ADMIN FUNCTIONS (we'll secure these later) ---

// @desc    Create a new tour
// @route   POST /api/tours
exports.createTour = async (req, res) => {
    try {
        const { name, description, price, duration, latitude, longitude, is_active } = req.body;
        
        const tourData = {
            name,
            description,
            price,
            duration,
            is_active: is_active === 'true' || is_active === true || is_active === 1 ? 1 : 0
        };

        // Only add latitude/longitude if they have valid values
        if (latitude !== undefined && latitude !== '') {
            tourData.latitude = latitude;
        }
        if (longitude !== undefined && longitude !== '') {
            tourData.longitude = longitude;
        }

        if (req.file) {
            tourData.image_filename = req.file.filename;
        }

        const tour = await Tour.create(tourData);

        res.status(201).json(tour);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Update a tour
// @route   PUT /api/tours/:id
exports.updateTour = async (req, res) => {
    try {
        const { name, description, price, duration, is_active, latitude, longitude } = req.body;
        const tour = await Tour.findByPk(req.params.id);

        if (tour) {
            // Delete old image if new one is uploaded
            if (req.file && tour.image_filename) {
                const oldImagePath = path.join(__dirname, '../public/uploads', tour.image_filename);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }

            if (name !== undefined) tour.name = name;
            if (description !== undefined) tour.description = description;
            if (price !== undefined) tour.price = price;
            if (duration !== undefined) tour.duration = duration;
            if (latitude !== undefined && latitude !== '') tour.latitude = latitude;
            if (longitude !== undefined && longitude !== '') tour.longitude = longitude;
            if (is_active !== undefined) {
                tour.is_active = is_active === 'true' || is_active === true || is_active === 1 ? 1 : 0;
            }
            
            if (req.file) {
                tour.image_filename = req.file.filename;
            }

            const updatedTour = await tour.save();
            res.json(updatedTour);
        } else {
            res.status(404).json({ message: 'Tour not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Delete a tour
// @route   DELETE /api/tours/:id
exports.deleteTour = async (req, res) => {
    try {
        const tour = await Tour.findByPk(req.params.id);

        if (tour) {
            // Delete associated image
            if (tour.image_filename) {
                const imagePath = path.join(__dirname, '../public/uploads', tour.image_filename);
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
            }

            await tour.destroy();
            res.json({ message: 'Tour removed' });
        } else {
            res.status(404).json({ message: 'Tour not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};