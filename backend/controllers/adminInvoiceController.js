const { Op } = require('sequelize');
const Invoice = require('../models/Invoice');
const InvoiceItem = require('../models/InvoiceItem');
const Booking = require('../models/Booking');
const TourBooking = require('../models/TourBooking');
const User = require('../models/User');
const Room = require('../models/Room');
const RoomType = require('../models/RoomType');
const Tour = require('../models/Tour');

// @desc    Get all invoices
// @route   GET /api/admin/invoices
// @access  Private/Admin
exports.getInvoices = async (req, res) => {
    try {
        const invoices = await Invoice.findAll({
            include: [
                {
                    model: Booking,
                    include: [
                        {
                            model: Room,
                            include: [{ model: RoomType, as: 'RoomType' }]
                        },
                        {
                            model: User,
                            as: 'Guest',
                            attributes: ['id', 'first_name', 'last_name', 'email']
                        }
                    ]
                },
                {
                    model: TourBooking,
                    include: [
                        { model: Tour },
                        {
                            model: User,
                            as: 'Guest',
                            attributes: ['id', 'first_name', 'last_name', 'email']
                        }
                    ]
                },
                { model: InvoiceItem }
            ],
            order: [['created_at', 'DESC']]
        });

        console.log('Invoices found:', invoices.length);

        // Format response with guest info
        const formattedInvoices = invoices.map(invoice => {
            const invoiceData = invoice.toJSON();
            let guest = null;
            
            if (invoiceData.Booking && invoiceData.Booking.Guest) {
                guest = invoiceData.Booking.Guest;
            } else if (invoiceData.TourBooking && invoiceData.TourBooking.Guest) {
                guest = invoiceData.TourBooking.Guest;
            }

            return {
                ...invoiceData,
                guest
            };
        });

        res.json(formattedInvoices);
    } catch (error) {
        console.error('Error in getInvoices:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get invoice statistics
// @route   GET /api/admin/invoices/stats
// @access  Private/Admin
exports.getInvoiceStats = async (req, res) => {
    try {
        const { Op } = require('sequelize');
        const totalInvoices = await Invoice.count({ where: { status: { [Op.ne]: 'refunded' } } });
        const paidInvoices = await Invoice.count({ where: { status: 'paid' } });
        const unpaidInvoices = await Invoice.count({ where: { status: 'unpaid' } });
        const partialInvoices = await Invoice.count({ where: { status: 'partial' } });
        const refundedInvoices = await Invoice.count({ where: { status: 'refunded' } });

        const totalAmount = await Invoice.sum('total_amount', { where: { status: { [Op.ne]: 'refunded' } } }) || 0;
        const paidAmount = await Invoice.sum('total_amount', { where: { status: 'paid' } }) || 0;

        res.json({
            totalInvoices,
            paidInvoices,
            unpaidInvoices,
            partialInvoices,
            refundedInvoices,
            totalAmount: parseFloat(totalAmount),
            paidAmount: parseFloat(paidAmount),
            outstandingAmount: parseFloat(totalAmount) - parseFloat(paidAmount)
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get single invoice
// @route   GET /api/admin/invoices/:id
// @access  Private/Admin
exports.getInvoiceById = async (req, res) => {
    try {
        const invoice = await Invoice.findByPk(req.params.id, {
            include: [
                {
                    model: Booking,
                    include: [
                        {
                            model: Room,
                            include: [{ model: RoomType, as: 'RoomType' }]
                        }
                    ]
                },
                {
                    model: TourBooking,
                    include: [{ model: Tour }]
                },
                { model: InvoiceItem }
            ]
        });

        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        // Get guest info
        let guest = null;
        if (invoice.Booking) {
            guest = await User.findByPk(invoice.Booking.guest_id, {
                attributes: ['first_name', 'last_name', 'email', 'phone_number']
            });
        } else if (invoice.TourBooking) {
            guest = await User.findByPk(invoice.TourBooking.guest_id, {
                attributes: ['first_name', 'last_name', 'email', 'phone_number']
            });
        }

        res.json({
            ...invoice.toJSON(),
            guest
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Create or get invoice for booking
// @route   POST /api/admin/invoices/booking/:bookingId
// @access  Private/Admin
exports.createBookingInvoice = async (req, res) => {
    try {
        const booking = await Booking.findByPk(req.params.bookingId, {
            include: [
                {
                    model: Room,
                    include: [{ model: RoomType, as: 'RoomType' }]
                }
            ]
        });

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Check if invoice already exists
        let invoice = await Invoice.findOne({
            where: { booking_id: req.params.bookingId }
        });

        if (invoice) {
            return res.json({ message: 'Invoice already exists', invoice });
        }

        // Create new invoice
        invoice = await Invoice.create({
            booking_id: req.params.bookingId,
            issue_date: new Date(),
            due_date: new Date(),
            total_amount: 0,
            status: 'unpaid'
        });

        // Add room booking as first line item
        const description = `${booking.Room.RoomType.name} (${booking.Room.room_number}) - ${booking.check_in_date} to ${booking.check_out_date}`;
        
        await InvoiceItem.create({
            invoice_id: invoice.id,
            description,
            quantity: 1,
            unit_price: booking.total_price,
            total_price: booking.total_price
        });

        // Recalculate total
        const totalAmount = await InvoiceItem.sum('total_price', {
            where: { invoice_id: invoice.id }
        });

        await invoice.update({ total_amount: totalAmount });

        res.status(201).json(invoice);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Create or get invoice for tour booking
// @route   POST /api/admin/invoices/tour-booking/:tourBookingId
// @access  Private/Admin
exports.createTourBookingInvoice = async (req, res) => {
    try {
        const tourBooking = await TourBooking.findByPk(req.params.tourBookingId, {
            include: [{ model: Tour }]
        });

        if (!tourBooking) {
            return res.status(404).json({ message: 'Tour booking not found' });
        }

        // Check if invoice already exists
        let invoice = await Invoice.findOne({
            where: { tour_booking_id: req.params.tourBookingId }
        });

        if (invoice) {
            return res.json({ message: 'Invoice already exists', invoice });
        }

        // Create new invoice
        invoice = await Invoice.create({
            tour_booking_id: req.params.tourBookingId,
            issue_date: new Date(),
            due_date: new Date(),
            total_amount: 0,
            status: 'unpaid'
        });

        // Add tour booking as first line item
        const description = `${tourBooking.Tour.name} - ${tourBooking.booking_date} (${tourBooking.number_of_pax} pax)`;
        
        await InvoiceItem.create({
            invoice_id: invoice.id,
            description,
            quantity: tourBooking.number_of_pax,
            unit_price: tourBooking.Tour.price,
            total_price: tourBooking.total_price
        });

        // Recalculate total
        const totalAmount = await InvoiceItem.sum('total_price', {
            where: { invoice_id: invoice.id }
        });

        await invoice.update({ total_amount: totalAmount });

        res.status(201).json(invoice);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Mark invoice as paid
// @route   PUT /api/admin/invoices/:id/mark-paid
// @access  Private/Admin
exports.markInvoicePaid = async (req, res) => {
    try {
        const invoice = await Invoice.findByPk(req.params.id);
        
        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        await invoice.update({ status: 'paid' });

        // Update related booking payment status
        if (invoice.booking_id) {
            await Booking.update(
                {
                    payment_status: 'paid',
                    amount_paid: invoice.total_amount,
                    balance_due: 0
                },
                { where: { id: invoice.booking_id } }
            );
        }

        if (invoice.tour_booking_id) {
            await TourBooking.update(
                {
                    payment_status: 'paid',
                    amount_paid: invoice.total_amount,
                    balance_due: 0
                },
                { where: { id: invoice.tour_booking_id } }
            );
        }

        res.json({ message: 'Invoice marked as paid successfully', invoice });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Add item to invoice
// @route   POST /api/admin/invoices/:id/items
// @access  Private/Admin
exports.addInvoiceItem = async (req, res) => {
    try {
        const { description, quantity, unit_price } = req.body;
        
        const invoice = await Invoice.findByPk(req.params.id);
        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        const total_price = quantity * unit_price;

        const item = await InvoiceItem.create({
            invoice_id: req.params.id,
            description,
            quantity,
            unit_price,
            total_price
        });

        // Recalculate invoice total
        const totalAmount = await InvoiceItem.sum('total_price', {
            where: { invoice_id: req.params.id }
        });

        await invoice.update({ total_amount: totalAmount });

        res.status(201).json(item);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Delete invoice item
// @route   DELETE /api/admin/invoice-items/:id
// @access  Private/Admin
exports.deleteInvoiceItem = async (req, res) => {
    try {
        const item = await InvoiceItem.findByPk(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Invoice item not found' });
        }

        const invoiceId = item.invoice_id;
        await item.destroy();

        // Recalculate invoice total
        const invoice = await Invoice.findByPk(invoiceId);
        const totalAmount = await InvoiceItem.sum('total_price', {
            where: { invoice_id: invoiceId }
        }) || 0;

        await invoice.update({ total_amount: totalAmount });

        res.json({ message: 'Invoice item deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Generate PDF invoice
// @route   GET /api/admin/invoices/:id/pdf
// @access  Private/Admin
exports.generateInvoicePDF = async (req, res) => {
    try {
        const invoice = await Invoice.findByPk(req.params.id, {
            include: [
                {
                    model: Booking,
                    include: [
                        {
                            model: Room,
                            include: [{ model: RoomType, as: 'RoomType' }]
                        },
                        {
                            model: User,
                            as: 'Guest',
                            attributes: ['id', 'first_name', 'last_name', 'email', 'phone_number']
                        }
                    ]
                },
                {
                    model: TourBooking,
                    include: [
                        { model: Tour },
                        {
                            model: User,
                            as: 'Guest',
                            attributes: ['id', 'first_name', 'last_name', 'email', 'phone_number']
                        }
                    ]
                },
                { model: InvoiceItem }
            ]
        });

        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        // Get guest info
        let guest = null;
        if (invoice.Booking && invoice.Booking.Guest) {
            guest = invoice.Booking.Guest;
        } else if (invoice.TourBooking && invoice.TourBooking.Guest) {
            guest = invoice.TourBooking.Guest;
        }

        // For now, return HTML that can be converted to PDF on the frontend
        // In production, you would use a library like puppeteer or pdfkit
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Invoice #${invoice.id}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 40px; }
                    .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
                    .company { text-align: right; }
                    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
                    th { background-color: #f5f5f5; }
                    .total { text-align: right; font-size: 18px; font-weight: bold; margin-top: 20px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div>
                        <h1>INVOICE</h1>
                        <p>Invoice #${invoice.id}</p>
                    </div>
                    <div class="company">
                        <h2>Visit Mindoro Resort</h2>
                        <p>Oriental Mindoro, Philippines</p>
                        <p>contact@visitmindoro.com</p>
                    </div>
                </div>
                <div>
                    <p><strong>Bill To:</strong></p>
                    <p>${guest?.first_name} ${guest?.last_name}</p>
                    <p>${guest?.email}</p>
                    ${guest?.phone_number ? `<p>${guest.phone_number}</p>` : ''}
                </div>
                <div>
                    <p><strong>Issue Date:</strong> ${new Date(invoice.issue_date).toLocaleDateString()}</p>
                    <p><strong>Due Date:</strong> ${new Date(invoice.due_date).toLocaleDateString()}</p>
                    <p><strong>Status:</strong> ${invoice.status.toUpperCase()}</p>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th>Quantity</th>
                            <th>Unit Price</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${invoice.InvoiceItems.map(item => `
                            <tr>
                                <td>${item.description}</td>
                                <td>${item.quantity}</td>
                                <td>₱${parseFloat(item.unit_price).toLocaleString()}</td>
                                <td>₱${parseFloat(item.total_price).toLocaleString()}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <div class="total">
                    <p>TOTAL: ₱${parseFloat(invoice.total_amount).toLocaleString()}</p>
                </div>
                <div style="text-align: center; margin-top: 40px; color: #666;">
                    <p>Thank you for your business!</p>
                    <p>For inquiries, please contact us at contact@visitmindoro.com</p>
                </div>
            </body>
            </html>
        `;

        res.setHeader('Content-Type', 'text/html');
        res.send(html);
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = exports;
