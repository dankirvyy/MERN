const Tour = require('../models/Tour');
const { Op } = require('sequelize'); // 1. IMPORT Op FOR SEARCHING

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
        const { name, description, price, duration, image_filename } = req.body;
        
        const tour = await Tour.create({
            name,
            description,
            price,
            duration,
            image_filename,
            is_active: 1, // Default to active
        });

        res.status(201).json(tour);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Update a tour
// @route   PUT /api/tours/:id
exports.updateTour = async (req, res) => {
    try {
        const { name, description, price, duration, is_active, image_filename } = req.body;
        const tour = await Tour.findByPk(req.params.id);

        if (tour) {
            tour.name = name || tour.name;
            tour.description = description || tour.description;
            tour.price = price || tour.price;
            tour.duration = duration || tour.duration;
            tour.is_active = is_active;
            tour.image_filename = image_filename || tour.image_filename;

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
            await tour.destroy();
            res.json({ message: 'Tour removed' });
        } else {
            res.status(404).json({ message: 'Tour not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};