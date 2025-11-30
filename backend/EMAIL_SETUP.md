# Email Setup Guide

## Option 1: Gmail (Recommended for Testing)

### Step 1: Enable 2-Factor Authentication
1. Go to https://myaccount.google.com/security
2. Enable "2-Step Verification" if not already enabled

### Step 2: Generate App Password
1. Go to https://myaccount.google.com/apppasswords
2. Select app: "Mail"
3. Select device: "Other" → Enter "Visit Mindoro Backend"
4. Click "Generate"
5. Copy the 16-character password (no spaces)

### Step 3: Update .env File
```env
EMAIL_USER=yourgmail@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop  # Your 16-character app password
SENDER_EMAIL=yourgmail@gmail.com
SENDER_NAME=Visit Mindoro
REPLY_TO_EMAIL=yourgmail@gmail.com
```

### Step 4: Restart Backend Server
```bash
cd backend
npm start
```

---

## Option 2: SendGrid (For Production)

### Step 1: Verify Sender Identity
1. Go to https://app.sendgrid.com/settings/sender_auth
2. Click "Verify a Single Sender"
3. Enter your email details
4. Check email and click verification link

### Step 2: Update emailService.js
Uncomment the SendGrid configuration:
```javascript
const transporter = nodemailer.createTransport({
    host: 'smtp.sendgrid.net',
    port: 587,
    secure: false,
    auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY
    }
});
```

### Step 3: Update .env
```env
SENDGRID_API_KEY=SG.your_api_key_here
SENDER_EMAIL=verified@yourdomain.com
```

---

## Testing

1. Try forgot password: http://localhost:5173/forgot-password
2. Enter your email
3. Check inbox for 6-digit code
4. Code expires in 10 minutes

## Troubleshooting

**Gmail Error: "Less secure app access"**
- Solution: Use App Password (see Step 2 above)

**SendGrid Error: "Sender Identity not verified"**
- Solution: Verify your sender email in SendGrid dashboard

**No email received:**
- Check spam/junk folder
- Verify EMAIL_USER and EMAIL_PASSWORD in .env
- Check backend console for error messages
- Try sending test email with your credentials
