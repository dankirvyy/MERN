const RoomType = require('../models/RoomType');
const Room = require('../models/Room'); // We need the Room model
const { Op } = require('sequelize');
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
        cb(null, 'roomtype-' + uniqueSuffix + path.extname(file.originalname));
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

// @desc    Fetch all room types (WITH SEARCH, LOCATION FILTER & SORT)
// @route   GET /api/room-types
exports.getAllRoomTypes = async (req, res) => {
    try {
        const { search, sort, location } = req.query;

        let whereOptions = {};
        let orderOptions = [];

        if (search) {
            whereOptions.name = { [Op.like]: `%${search}%` };
        }

        if (location) {
            whereOptions.location = location;
        }

        switch (sort) {
            case 'price_asc':
                orderOptions.push(['base_price', 'ASC']);
                break;
            case 'price_desc':
                orderOptions.push(['base_price', 'DESC']);
                break;
            case 'name_asc':
                orderOptions.push(['name', 'ASC']);
                break;
            default:
                orderOptions.push(['name', 'ASC']);
        }

        const roomTypes = await RoomType.findAll({
            where: whereOptions,
            order: orderOptions
        });
        
        res.json(roomTypes);

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// --- NEW FUNCTION 1 ---
// @desc    Get single room type by ID
// @route   GET /api/room-types/:id
exports.getRoomTypeById = async (req, res) => {
    try {
        const roomType = await RoomType.findByPk(req.params.id);
        if (roomType) {
            res.json(roomType);
        } else {
            res.status(404).json({ message: 'Room type not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// --- NEW FUNCTION 2 ---
// @desc    Get available rooms for a specific room type
// @route   GET /api/room-types/:id/available
exports.getAvailableRooms = async (req, res) => {
    try {
        const rooms = await Room.findAll({
            where: {
                room_type_id: req.params.id,
                status: 'available' // Only find rooms marked 'available'
            }
        });
        res.json(rooms);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// --- ADMIN FUNCTIONS ---

// @desc    Create a new room type
// @route   POST /api/room-types
exports.createRoomType = async (req, res) => {
    try {
        const { name, description, base_price, capacity, location, latitude, longitude } = req.body;
        
        const roomTypeData = {
            name,
            description,
            base_price,
            capacity,
            location: location || null,
            latitude: latitude || null,
            longitude: longitude || null
        };

        if (req.file) {
            roomTypeData.image_filename = req.file.filename;
        }
        
        const roomType = await RoomType.create(roomTypeData);

        res.status(201).json(roomType);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Update a room type
// @route   PUT /api/room-types/:id
exports.updateRoomType = async (req, res) => {
    try {
        const { name, description, base_price, capacity, location, latitude, longitude } = req.body;
        const roomType = await RoomType.findByPk(req.params.id);

        if (roomType) {
            // Delete old image if new one is uploaded
            if (req.file && roomType.image_filename) {
                const oldImagePath = path.join(__dirname, '../public/uploads', roomType.image_filename);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }

            roomType.name = name || roomType.name;
            roomType.description = description || roomType.description;
            roomType.base_price = base_price || roomType.base_price;
            roomType.capacity = capacity || roomType.capacity;
            roomType.location = location !== undefined ? location : roomType.location;
            roomType.latitude = latitude !== undefined ? latitude : roomType.latitude;
            roomType.longitude = longitude !== undefined ? longitude : roomType.longitude;
            
            if (req.file) {
                roomType.image_filename = req.file.filename;
            }

            const updatedRoomType = await roomType.save();
            res.json(updatedRoomType);
        } else {
            res.status(404).json({ message: 'Room type not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Delete a room type
// @route   DELETE /api/room-types/:id
exports.deleteRoomType = async (req, res) => {
    try {
        const roomType = await RoomType.findByPk(req.params.id);

        if (roomType) {
            // Delete associated image
            if (roomType.image_filename) {
                const imagePath = path.join(__dirname, '../public/uploads', roomType.image_filename);
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
            }

            await roomType.destroy();
            res.json({ message: 'Room type removed' });
        } else {
            res.status(404).json({ message: 'Room type not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};