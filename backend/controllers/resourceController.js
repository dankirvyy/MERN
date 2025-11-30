const TourBooking = require('../models/TourBooking');
const Resource = require('../models/Resource');
const ResourceSchedule = require('../models/ResourceSchedule');
const User = require('../models/User');
const Tour = require('../models/Tour');

// Get booking with assigned resources
const getTourBookingResources = async (req, res) => {
    try {
        const { id } = req.params;

        const assignedResources = await ResourceSchedule.findAll({
            where: { tour_booking_id: id },
            include: [
                {
                    model: Resource,
                    attributes: ['id', 'name', 'type']
                }
            ]
        });

        const formattedResources = assignedResources.map(schedule => ({
            schedule_id: schedule.id,
            name: schedule.Resource.name,
            type: schedule.Resource.type,
            start_time: schedule.start_time,
            end_time: schedule.end_time
        }));

        res.json(formattedResources);
    } catch (error) {
        console.error('Error fetching assigned resources:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get available resources
const getAvailableResources = async (req, res) => {
    try {
        const resources = await Resource.findAll({
            where: { is_available: true },
            attributes: ['id', 'name', 'type', 'capacity', 'quantity', 'available_quantity'],
            order: [['type', 'ASC'], ['name', 'ASC']]
        });

        res.json(resources);
    } catch (error) {
        console.error('Error fetching available resources:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Assign resource to tour booking
const assignResourceToBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const { resource_id, start_time, end_time } = req.body;

        // Check if booking exists
        const booking = await TourBooking.findByPk(id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Check if resource exists
        const resource = await Resource.findByPk(resource_id);
        if (!resource) {
            return res.status(404).json({ message: 'Resource not found' });
        }

        // Check if resource has available quantity
        if (resource.available_quantity <= 0) {
            return res.status(400).json({ message: `No ${resource.name} available. Current available: 0` });
        }

        // Check if resource is already assigned to this booking
        const existingAssignment = await ResourceSchedule.findOne({
            where: {
                tour_booking_id: id,
                resource_id: resource_id
            }
        });

        if (existingAssignment) {
            return res.status(400).json({ message: 'Resource already assigned to this booking' });
        }

        // Deduct available quantity
        resource.available_quantity -= 1;
        await resource.save();

        // Create resource schedule
        const schedule = await ResourceSchedule.create({
            resource_id,
            tour_booking_id: id,
            start_time,
            end_time
        });

        console.log(`✅ Resource ${resource.name} assigned. Available: ${resource.available_quantity + 1} → ${resource.available_quantity}`);

        res.status(201).json({
            message: 'Resource assigned successfully',
            schedule,
            remaining_quantity: resource.available_quantity
        });
    } catch (error) {
        console.error('Error assigning resource:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Unassign resource from tour booking
const unassignResourceFromBooking = async (req, res) => {
    try {
        const { id, scheduleId } = req.params;

        const schedule = await ResourceSchedule.findOne({
            where: {
                id: scheduleId,
                tour_booking_id: id
            },
            include: [Resource]
        });

        if (!schedule) {
            return res.status(404).json({ message: 'Resource assignment not found' });
        }

        // Restore available quantity when unassigning
        const resource = schedule.Resource;
        resource.available_quantity += 1;
        await resource.save();

        await schedule.destroy();

        console.log(`✅ Resource ${resource.name} unassigned. Available: ${resource.available_quantity - 1} → ${resource.available_quantity}`);

        res.json({ 
            message: 'Resource un-assigned successfully',
            restored_quantity: resource.available_quantity
        });
    } catch (error) {
        console.error('Error un-assigning resource:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get single tour booking details
const getTourBookingById = async (req, res) => {
    try {
        const { id } = req.params;

        const booking = await TourBooking.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'Guest',
                    attributes: ['id', 'first_name', 'last_name', 'email']
                },
                {
                    model: Tour,
                    attributes: ['id', 'name', 'description', 'price']
                }
            ]
        });

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        res.json(booking);
    } catch (error) {
        console.error('Error fetching tour booking:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getTourBookingResources,
    getAvailableResources,
    assignResourceToBooking,
    unassignResourceFromBooking,
    getTourBookingById
};
