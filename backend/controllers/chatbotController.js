const RoomType = require('../models/RoomType');
const Tour = require('../models/Tour');
const Booking = require('../models/Booking');
const TourBooking = require('../models/TourBooking');
const User = require('../models/User');
const Room = require('../models/Room');
const { Op } = require('sequelize');

// Helper function to get system context from database
async function getSystemContext() {
    try {
        // Get room types data
        const roomTypes = await RoomType.findAll({
            attributes: ['id', 'name', 'description', 'capacity', 'base_price']
        });

        // Get tours data
        const tours = await Tour.findAll({
            attributes: ['id', 'name', 'description', 'duration', 'price']
        });

        // Get booking statistics
        const totalBookings = await Booking.count();
        const totalTourBookings = await TourBooking.count();

        // Get available rooms count
        const availableRooms = await Room.count({ where: { status: 'available' } });

        return {
            roomTypes: roomTypes.map(rt => ({
                name: rt.name,
                description: rt.description,
                capacity: rt.capacity,
                price: parseFloat(rt.base_price)
            })),
            tours: tours.map(t => ({
                name: t.name,
                description: t.description,
                duration: t.duration,
                price: parseFloat(t.price)
            })),
            statistics: {
                totalBookings,
                totalTourBookings,
                availableRooms,
                availableRoomTypes: roomTypes.length
            }
        };
    } catch (error) {
        console.error('Error fetching system context:', error);
        return {
            roomTypes: [],
            tours: [],
            statistics: {}
        };
    }
}

// Helper function to get user-specific context
async function getUserContext(userId) {
    try {
        if (!userId) return null;

        const user = await User.findByPk(userId, {
            attributes: ['id', 'first_name', 'last_name', 'email', 'total_visits', 'guest_type']
        });

        if (!user) return null;

        // Get user's bookings
        const userBookings = await Booking.findAll({
            where: { guest_id: userId },
            limit: 5,
            order: [['created_at', 'DESC']],
            attributes: ['id', 'status', 'check_in_date', 'check_out_date', 'total_price']
        });

        // Get user's tour bookings
        const userTourBookings = await TourBooking.findAll({
            where: { guest_id: userId },
            limit: 5,
            order: [['booking_date', 'DESC']],
            attributes: ['id', 'status', 'booking_date', 'total_price']
        });

        return {
            name: `${user.first_name} ${user.last_name}`,
            guestType: user.guest_type,
            totalVisits: user.total_visits,
            recentBookings: userBookings.length,
            recentTourBookings: userTourBookings.length
        };
    } catch (error) {
        console.error('Error fetching user context:', error);
        return null;
    }
}

// Simple rule-based response generator
function generateResponse(message, systemContext, userContext) {
    const lowerMessage = message.toLowerCase();
    
    // Room-related questions
    if (lowerMessage.includes('room') || lowerMessage.includes('accommodation')) {
        if (lowerMessage.includes('how many') || lowerMessage.includes('available')) {
            const availableRooms = systemContext.statistics.availableRooms || 0;
            return `We currently have ${availableRooms} rooms available across ${systemContext.roomTypes.length} room types:\n\n${systemContext.roomTypes.map(rt => 
                `• ${rt.name} - ₱${rt.price.toLocaleString()}/night (${rt.capacity} guests)`
            ).join('\n')}\n\nWould you like to book a room? Visit our Rooms page to check availability!`;
        }
        
        if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('how much')) {
            return `Here are our room rates:\n\n${systemContext.roomTypes.map(rt => 
                `• ${rt.name}: ₱${rt.price.toLocaleString()} per night\n  Capacity: ${rt.capacity} guests\n  ${rt.description || ''}`
            ).join('\n\n')}\n\nPrices include standard amenities. Would you like to make a reservation?`;
        }
        
        if (lowerMessage.includes('type') || lowerMessage.includes('kind')) {
            return `We offer ${systemContext.roomTypes.length} types of rooms:\n\n${systemContext.roomTypes.map(rt => 
                `• ${rt.name}\n  ${rt.description || 'Comfortable accommodation'}\n  Capacity: ${rt.capacity} guests | ₱${rt.price.toLocaleString()}/night`
            ).join('\n\n')}\n\nEach room is designed for comfort and convenience!`;
        }
    }
    
    // Tour-related questions
    if (lowerMessage.includes('tour') || lowerMessage.includes('activity') || lowerMessage.includes('activities')) {
        if (lowerMessage.includes('how many') || lowerMessage.includes('available')) {
            return `We offer ${systemContext.tours.length} exciting tours:\n\n${systemContext.tours.map(t => 
                `• ${t.name} - ₱${t.price.toLocaleString()}/person\n  ${t.description || ''}`
            ).join('\n\n')}\n\nEach tour is an unforgettable experience!`;
        }
        
        if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('how much')) {
            return `Here are our tour prices:\n\n${systemContext.tours.map(t => 
                `• ${t.name}: ₱${t.price.toLocaleString()} per person\n  Duration: ${t.duration || 'Full day'}`
            ).join('\n\n')}\n\nReady to explore Mindoro?`;
        }
        
        return `We offer ${systemContext.tours.length} amazing tours:\n\n${systemContext.tours.map(t => 
            `• ${t.name}\n  ${t.description || 'Exciting experience'}\n  ₱${t.price.toLocaleString()}/person`
        ).join('\n\n')}\n\nWhich tour interests you?`;
    }
    
    // Payment questions
    if (lowerMessage.includes('payment') || lowerMessage.includes('pay')) {
        if (lowerMessage.includes('method') || lowerMessage.includes('how')) {
            return `We accept the following payment methods:\n\n• PayPal - Secure international payments\n• GCash - Convenient local payments\n\nYou can choose to:\n✓ Pay full amount upfront\n✓ Pay 50% downpayment (balance due on arrival)\n\nBoth options are available during checkout!`;
        }
        
        if (lowerMessage.includes('downpayment') || lowerMessage.includes('down payment') || lowerMessage.includes('installment')) {
            return `Yes! We offer flexible payment options:\n\n✓ Full Payment - Pay 100% now\n✓ Downpayment - Pay 50% now, 50% on arrival\n\nYou can choose your preferred option during the booking process. This applies to both room and tour bookings!`;
        }
    }
    
    // Booking questions
    if (lowerMessage.includes('book') || lowerMessage.includes('reserve') || lowerMessage.includes('reservation')) {
        return `Booking with us is easy! Here's how:\n\n1. Browse our Rooms or Tours pages\n2. Select your preferred option\n3. Choose your dates and number of guests\n4. Select payment method (PayPal or GCash)\n5. Choose full payment or 50% downpayment\n6. Complete booking and receive confirmation email\n\nFor room bookings: Check-in is at 2:00 PM, Check-out at 12:00 PM\n\nReady to book? Visit our Rooms or Tours page!`;
    }
    
    // Check-in/out questions
    if (lowerMessage.includes('check') || lowerMessage.includes('time')) {
        return `Check-in and Check-out Times:\n\n• Check-in: 2:00 PM (14:00)\n• Check-out: 12:00 PM (12:00)\n\nEarly check-in or late check-out may be available upon request, subject to room availability. Please contact us if you need special arrangements!`;
    }
    
    // Cancellation questions
    if (lowerMessage.includes('cancel') || lowerMessage.includes('refund')) {
        return `Cancellation Policy:\n\nYou can cancel your booking from your profile page. Here's what you need to know:\n\n• Cancelled bookings can be refunded by admin\n• Refund processing takes 5-10 business days\n• Refunds are returned to original payment method\n• You'll receive a confirmation email\n\nTo cancel, go to My Profile → View your booking → Cancel\n\nNeed help? Contact our support team!`;
    }
    
    // Contact/support questions
    if (lowerMessage.includes('contact') || lowerMessage.includes('support') || lowerMessage.includes('help')) {
        return `Need assistance? We're here to help!\n\n📧 Email: info@visitmindoro.xyz\n📞 Phone: Available on our Contact page\n💬 Live Chat: You're using it right now!\n\nYou can also visit our Contact page for more ways to reach us. We typically respond within 24 hours!`;
    }
    
    // User-specific questions
    if (userContext && (lowerMessage.includes('my booking') || lowerMessage.includes('my reservation') || lowerMessage.includes('my history'))) {
        return `Hello ${userContext.name}! 👋\n\nYour account summary:\n• Guest Type: ${userContext.guestType.toUpperCase()}\n• Total Visits: ${userContext.totalVisits}\n• Room Bookings: ${userContext.recentBookings}\n• Tour Bookings: ${userContext.recentTourBookings}\n\nTo view full details, visit your Profile page where you can see all your bookings, manage reservations, and update your information!`;
    }
    
    // Greeting
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
        const name = userContext ? userContext.name : 'there';
        return `Hello ${name}! 👋 Welcome to Visit Mindoro Resort!\n\nI can help you with:\n• Room information and availability\n• Tour packages and activities\n• Booking procedures\n• Payment options\n• Check-in/out times\n• Cancellation policy\n\nWhat would you like to know?`;
    }
    
    // Thank you
    if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
        return `You're very welcome! 😊 If you have any other questions about our rooms, tours, or bookings, feel free to ask. We're here to help make your Mindoro experience unforgettable!`;
    }
    
    // Default response with suggestions
    return `I'd be happy to help! I can assist you with:\n\n• 🏨 Room types and pricing\n• 🌴 Available tours and activities\n• 💳 Payment methods and options\n• 📅 Booking procedures\n• ⏰ Check-in/out times\n• ❌ Cancellation policy\n\nYou can ask me questions like:\n"How many rooms are available?"\n"What tours do you offer?"\n"Can I pay a downpayment?"\n"What are your room rates?"\n\nWhat would you like to know?`;
}

// @desc    Process chatbot message
// @route   POST /api/chatbot
// @access  Public (or Protected based on your needs)
exports.sendMessage = async (req, res) => {
    try {
        const { message, conversationHistory = [] } = req.body;
        const userId = req.user?.id; // Get user ID if authenticated

        if (!message) {
            return res.status(400).json({ message: 'Message is required' });
        }

        // Get system context
        const systemContext = await getSystemContext();
        
        // Get user context if authenticated
        const userContext = await getUserContext(userId);

        // Generate response based on rules and database data
        const response = generateResponse(message, systemContext, userContext);

        res.json({
            success: true,
            response: response,
            timestamp: new Date()
        });

    } catch (error) {
        console.error('Chatbot error:', error);
        
        res.status(500).json({ 
            message: 'Error processing your message',
            error: error.message 
        });
    }
};

// @desc    Get suggested questions
// @route   GET /api/chatbot/suggestions
// @access  Public
exports.getSuggestions = async (req, res) => {
    try {
        const suggestions = [
            "What room types are available?",
            "What tours do you offer?",
            "How much does a room cost?",
            "What payment methods do you accept?",
            "Can I pay a downpayment instead of full amount?",
            "What is your cancellation policy?",
            "What time is check-in and check-out?",
            "Do you have family rooms?",
            "What amenities are included?"
        ];

        res.json({ suggestions });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching suggestions' });
    }
};

module.exports = exports;
