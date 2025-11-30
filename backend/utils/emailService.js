const nodemailer = require('nodemailer');

// Create SendGrid transporter
const transporter = nodemailer.createTransport({
    host: 'smtp.sendgrid.net',
    port: 587,
    secure: false, // Use TLS
    auth: {
        user: 'apikey', // This is always 'apikey' for SendGrid
        pass: process.env.SENDGRID_API_KEY
    }
});

/**
 * Generate HTML email template
 */
const generateEmailTemplate = (title, guestName, introMessage, details, callToAction) => {
    let detailsHtml = '';
    for (const [key, value] of Object.entries(details)) {
        detailsHtml += `
            <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eeeeee; font-size: 14px; color: #555555;">${key}</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eeeeee; font-size: 14px; color: #111111; text-align: right;"><strong>${value}</strong></td>
            </tr>
        `;
    }

    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${title}</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
            <table cellpadding="0" cellspacing="0" style="width: 100%; max-width: 600px; margin: 0 auto;">
                <tr>
                    <td align="center">
                        <table cellpadding="0" cellspacing="0" style="width: 100%; background: #ffffff; border: 1px solid #dddddd;">
                            <tr>
                                <td style="background: #f8f8f8; padding: 20px; text-align: center;">
                                    <h1 style="color: #dd4814; font-size: 24px; margin: 0;">Visit Mindoro</h1>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 30px;">
                                    <h2 style="font-size: 20px; color: #333333;">${title}</h2>
                                    <p style="font-size: 16px; line-height: 1.5; color: #333333;">Hi ${guestName},</p>
                                    <p style="font-size: 16px; line-height: 1.5; color: #333333;">${introMessage}</p>
                                    
                                    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                                        ${detailsHtml}
                                    </table>
                                    
                                    <p style="font-size: 16px; line-height: 1.5; color: #333333;">${callToAction}</p>
                                    <p style="font-size: 16px; line-height: 1.5; color: #333333;">Thank you,<br>The Visit Mindoro Team</p>
                                </td>
                            </tr>
                            <tr>
                                <td style="background: #f8f8f8; padding: 20px; text-align: center; font-size: 12px; color: #999999;">
                                    &copy; ${new Date().getFullYear()} Visit Mindoro. All rights reserved.
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
    `;
};

/**
 * Send booking confirmation email
 */
const sendBookingConfirmation = async (recipientEmail, guestName, bookingDetails) => {
    const subject = 'Booking Confirmation - Visit Mindoro';
    const title = 'Booking Confirmation';
    const introMessage = 'Thank you for booking with Visit Mindoro! Your reservation has been confirmed and is awaiting room assignment by our front desk.';
    const callToAction = 'We look forward to welcoming you! If you have any questions, feel free to contact us.';

    const htmlContent = generateEmailTemplate(title, guestName, introMessage, bookingDetails, callToAction);

    const mailOptions = {
        from: {
            name: process.env.SENDER_NAME || 'Visit Mindoro',
            address: process.env.SENDER_EMAIL || 'noreply@visitmindoro.com'
        },
        to: recipientEmail,
        replyTo: process.env.REPLY_TO_EMAIL || process.env.SENDER_EMAIL,
        subject: subject,
        html: htmlContent
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Booking confirmation email sent to:', recipientEmail);
        console.log('Message ID:', info.messageId);
        return true;
    } catch (error) {
        console.error('❌ Error sending booking confirmation email:', error.message);
        console.error('Full error:', error);
        return false;
    }
};

/**
 * Send tour booking confirmation email
 */
const sendTourBookingConfirmation = async (recipientEmail, guestName, tourDetails) => {
    const subject = 'Tour Booking Confirmation - Visit Mindoro';
    const title = 'Tour Booking Confirmation';
    const introMessage = 'Thank you for booking a tour with Visit Mindoro! Your tour reservation is pending confirmation by our admin team.';
    const callToAction = 'You will receive another email once your tour booking is confirmed. If you have any questions, feel free to contact us.';

    const htmlContent = generateEmailTemplate(title, guestName, introMessage, tourDetails, callToAction);

    const mailOptions = {
        from: {
            name: process.env.SENDER_NAME || 'Visit Mindoro',
            address: process.env.SENDER_EMAIL || 'noreply@visitmindoro.com'
        },
        to: recipientEmail,
        replyTo: process.env.REPLY_TO_EMAIL || process.env.SENDER_EMAIL,
        subject: subject,
        html: htmlContent
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Tour booking confirmation email sent to:', recipientEmail);
        console.log('Message ID:', info.messageId);
        return true;
    } catch (error) {
        console.error('❌ Error sending tour booking email:', error.message);
        console.error('Full error:', error);
        return false;
    }
};

/**
 * Send room assignment notification email
 */
const sendRoomAssignmentNotification = async (recipientEmail, guestName, assignmentDetails) => {
    const subject = 'Room Assignment - Visit Mindoro';
    const title = 'Your Room Has Been Assigned!';
    const introMessage = 'Good news! Your room has been assigned by our front desk team.';
    const callToAction = 'We look forward to seeing you on your check-in date. Have a great stay!';

    const htmlContent = generateEmailTemplate(title, guestName, introMessage, assignmentDetails, callToAction);

    const mailOptions = {
        from: {
            name: process.env.SENDER_NAME || 'Visit Mindoro',
            address: process.env.SENDER_EMAIL || 'noreply@visitmindoro.com'
        },
        to: recipientEmail,
        replyTo: process.env.REPLY_TO_EMAIL || process.env.SENDER_EMAIL,
        subject: subject,
        html: htmlContent
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Room assignment email sent to:', recipientEmail);
        console.log('Message ID:', info.messageId);
        return true;
    } catch (error) {
        console.error('❌ Error sending room assignment email:', error.message);
        console.error('Full error:', error);
        return false;
    }
};

/**
 * Send tour confirmation email (when admin confirms)
 */
const sendTourConfirmationEmail = async (recipientEmail, guestName, tourDetails) => {
    const subject = 'Tour Confirmed - Visit Mindoro';
    const title = 'Your Tour Has Been Confirmed!';
    const introMessage = 'Great news! Your tour booking has been confirmed by our team.';
    const callToAction = 'We look forward to showing you the beautiful sights of Mindoro. See you soon!';

    const htmlContent = generateEmailTemplate(title, guestName, introMessage, tourDetails, callToAction);

    const mailOptions = {
        from: {
            name: process.env.SENDER_NAME || 'Visit Mindoro',
            address: process.env.SENDER_EMAIL || 'noreply@visitmindoro.com'
        },
        to: recipientEmail,
        replyTo: process.env.REPLY_TO_EMAIL || process.env.SENDER_EMAIL,
        subject: subject,
        html: htmlContent
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Tour confirmation email sent to:', recipientEmail);
        console.log('Message ID:', info.messageId);
        return true;
    } catch (error) {
        console.error('❌ Error sending tour confirmation email:', error.message);
        console.error('Full error:', error);
        return false;
    }
};

/**
 * Send refund confirmation email for room booking
 */
const sendRefundConfirmation = async (recipientEmail, guestName, refundDetails) => {
    const subject = 'Refund Confirmation - Visit Mindoro';
    const title = 'Refund Processed';
    const introMessage = 'We have processed the refund for your cancelled booking.';
    const callToAction = 'The refund will be processed to your original payment method within 5-10 business days. If you have any questions, please don\'t hesitate to contact us.';

    const htmlContent = generateEmailTemplate(title, guestName, introMessage, refundDetails, callToAction);

    const mailOptions = {
        from: {
            name: process.env.SENDER_NAME || 'Visit Mindoro',
            address: process.env.SENDER_EMAIL || 'noreply@visitmindoro.com'
        },
        to: recipientEmail,
        replyTo: process.env.REPLY_TO_EMAIL || process.env.SENDER_EMAIL,
        subject: subject,
        html: htmlContent
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Refund confirmation email sent to:', recipientEmail);
        console.log('Message ID:', info.messageId);
        return true;
    } catch (error) {
        console.error('❌ Error sending refund confirmation email:', error.message);
        console.error('Full error:', error);
        return false;
    }
};

/**
 * Send refund confirmation email for tour booking
 */
const sendTourRefundConfirmation = async (recipientEmail, guestName, refundDetails) => {
    const subject = 'Tour Refund Confirmation - Visit Mindoro';
    const title = 'Tour Refund Processed';
    const introMessage = 'We have processed the refund for your cancelled tour booking.';
    const callToAction = 'The refund will be processed to your original payment method within 5-10 business days. If you have any questions, please don\'t hesitate to contact us.';

    const htmlContent = generateEmailTemplate(title, guestName, introMessage, refundDetails, callToAction);

    const mailOptions = {
        from: {
            name: process.env.SENDER_NAME || 'Visit Mindoro',
            address: process.env.SENDER_EMAIL || 'noreply@visitmindoro.com'
        },
        to: recipientEmail,
        replyTo: process.env.REPLY_TO_EMAIL || process.env.SENDER_EMAIL,
        subject: subject,
        html: htmlContent
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Tour refund confirmation email sent to:', recipientEmail);
        console.log('Message ID:', info.messageId);
        return true;
    } catch (error) {
        console.error('❌ Error sending tour refund confirmation email:', error.message);
        console.error('Full error:', error);
        return false;
    }
};

module.exports = {
    sendBookingConfirmation,
    sendTourBookingConfirmation,
    sendRoomAssignmentNotification,
    sendTourConfirmationEmail,
    sendRefundConfirmation,
    sendTourRefundConfirmation
};
