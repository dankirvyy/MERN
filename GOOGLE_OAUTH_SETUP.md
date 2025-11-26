# Google OAuth Setup Guide

## Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing project
3. Enable Google+ API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API"
   - Click "Enable"

4. Create OAuth 2.0 Credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application"
   - Name: "Visit Mindoro MERN App"
   
5. Add Authorized redirect URIs:
   ```
   http://localhost:5001/api/auth/google/callback
   ```

6. Add Authorized JavaScript origins:
   ```
   http://localhost:5173
   http://localhost:5001
   ```

7. Copy your **Client ID** and **Client Secret**

## Step 2: Install Required Packages

Run in the backend directory:
```bash
npm install passport passport-google-oauth20 express-session
```

## Step 3: Update .env File

Add these values to `backend/.env`:
```
GOOGLE_CLIENT_ID=your_actual_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_actual_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:5001/api/auth/google/callback
FRONTEND_URL=http://localhost:5173
```

## Step 4: Restart Backend Server

```bash
cd backend
npm start
```

## Testing

1. Make sure backend is running on http://localhost:5001
2. Make sure frontend is running on http://localhost:5173
3. Click "Sign in with Google" button
4. Complete Google authentication
5. You'll be redirected back and logged in automatically

## Troubleshooting

- **Error 400: redirect_uri_mismatch**: Make sure the redirect URI in Google Console exactly matches the one in your .env file
- **Error 401**: Check your client ID and secret are correct
- **Session not persisting**: Make sure express-session is properly configured

## Production Deployment

When deploying to production:
1. Update redirect URIs in Google Console to include your production domain
2. Update .env with production URLs
3. Make sure to use HTTPS in production
