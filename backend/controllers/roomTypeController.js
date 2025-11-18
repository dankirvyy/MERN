const RoomType = require('../models/RoomType');
const Room = require('../models/Room'); // We need the Room model
const { Op } = require('sequelize');

// @desc    Fetch all room types (WITH SEARCH & SORT)
// @route   GET /api/room-types
exports.getAllRoomTypes = async (req, res) => {
    try {
        const { search, sort } = req.query;

        let whereOptions = {};
        let orderOptions = [];

        if (search) {
            whereOptions.name = { [Op.like]: `%${search}%` };
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
        const { name, description, base_price, capacity } = req.body;
        
        const roomType = await RoomType.create({
            name,
            description,
            base_price,
            capacity
        });

        res.status(201).json(roomType);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Update a room type
// @route   PUT /api/room-types/:id
exports.updateRoomType = async (req, res) => {
    try {
        const { name, description, base_price, capacity } = req.body;
        const roomType = await RoomType.findByPk(req.params.id);

        if (roomType) {
            roomType.name = name || roomType.name;
            roomType.description = description || roomType.description;
            roomType.base_price = base_price || roomType.base_price;
            roomType.capacity = capacity || roomType.capacity;

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
            await roomType.destroy();
            res.json({ message: 'Room type removed' });
        } else {
            res.status(404).json({ message: 'Room type not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};