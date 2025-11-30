const Contact = require('../models/Contact');
const { sendContactConfirmation, sendContactNotificationToAdmin } = require('../utils/emailService');

// Submit a contact form
exports.submitContact = async (req, res) => {
    try {
        const { name, email, message } = req.body;

        // Validation
        if (!name || !email || !message) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Create contact submission
        const contact = await Contact.create({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            message: message.trim(),
            user_id: req.user ? req.user.id : null,
            status: 'pending'
        });

        // Send confirmation email to user
        try {
            console.log('📧 Sending confirmation email to:', email);
            await sendContactConfirmation(email, name);
            console.log('✅ Confirmation email sent successfully');
        } catch (emailError) {
            console.error('❌ Failed to send confirmation email:', emailError.message);
            // Don't fail the request if email fails
        }

        // Send notification to admin
        try {
            console.log('📧 Sending notification email to admin: dankirvymanongsong@gmail.com');
            await sendContactNotificationToAdmin(name, email, message);
            console.log('✅ Admin notification email sent successfully');
        } catch (emailError) {
            console.error('❌ Failed to send admin notification:', emailError.message);
            // Don't fail the request if email fails
        }

        res.status(201).json({ 
            message: 'Your message has been sent successfully! We will get back to you soon.',
            contact: {
                id: contact.id,
                name: contact.name,
                email: contact.email,
                created_at: contact.created_at
            }
        });
    } catch (error) {
        console.error('Error submitting contact form:', error);
        res.status(500).json({ message: 'Failed to submit contact form', error: error.message });
    }
};

// Get all contact submissions (admin only)
exports.getAllContacts = async (req, res) => {
    try {
        const { status } = req.query;
        
        const whereClause = {};
        if (status) {
            whereClause.status = status;
        }

        const contacts = await Contact.findAll({
            where: whereClause,
            order: [['created_at', 'DESC']]
        });

        res.status(200).json({ contacts });
    } catch (error) {
        console.error('Error fetching contacts:', error);
        res.status(500).json({ message: 'Failed to fetch contacts', error: error.message });
    }
};

// Update contact status (admin only)
exports.updateContactStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['pending', 'read', 'replied'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const contact = await Contact.findByPk(id);
        if (!contact) {
            return res.status(404).json({ message: 'Contact not found' });
        }

        contact.status = status;
        await contact.save();

        res.status(200).json({ message: 'Contact status updated', contact });
    } catch (error) {
        console.error('Error updating contact status:', error);
        res.status(500).json({ message: 'Failed to update contact status', error: error.message });
    }
};

// Delete a contact (admin only)
exports.deleteContact = async (req, res) => {
    try {
        const { id } = req.params;

        const contact = await Contact.findByPk(id);
        if (!contact) {
            return res.status(404).json({ message: 'Contact not found' });
        }

        await contact.destroy();
        res.status(200).json({ message: 'Contact deleted successfully' });
    } catch (error) {
        console.error('Error deleting contact:', error);
        res.status(500).json({ message: 'Failed to delete contact', error: error.message });
    }
};
