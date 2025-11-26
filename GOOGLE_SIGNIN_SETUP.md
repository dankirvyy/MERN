# Google Sign-In Setup Instructions

## Step 1: Install Required NPM Packages

Open PowerShell in the backend directory and run:

```powershell
cd C:\wamp64\www\Web2\2Proj\MERN\backend
npm install passport passport-google-oauth20 express-session
```

## Step 2: Run Database Migration

Run this SQL in your MySQL database (phpMyAdmin or MySQL Workbench):

```sql
ALTER TABLE guests 
ADD COLUMN google_id VARCHAR(255) NULL UNIQUE AFTER password;

ALTER TABLE guests 
MODIFY COLUMN password VARCHAR(255) NULL;
```

Or import the file: `backend/migrations/add_google_id_to_guests.sql`

## Step 3: Set Up Google OAuth Credentials

1. Go to https://console.cloud.google.com/
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google+ API"
   - Click "Enable"

4. Create OAuth 2.0 Credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Application type: "Web application"
   - Name: "Visit Mindoro MERN"
   
5. Configure the OAuth consent screen if prompted:
   - User Type: External
   - Add your email
   - Add test users if needed

6. Add Authorized redirect URIs:
   ```
   http://localhost:5001/api/auth/google/callback
   ```

7. Add Authorized JavaScript origins:
   ```
   http://localhost:5173
   http://localhost:5001
   ```

8. Copy your **Client ID** and **Client Secret**

## Step 4: Update Environment Variables

Edit `backend/.env` and add these lines with your actual credentials:

```env
# Google OAuth Config
GOOGLE_CLIENT_ID=your_actual_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_actual_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5001/api/auth/google/callback
FRONTEND_URL=http://localhost:5173
```

Replace `your_actual_client_id` and `your_actual_client_secret` with the values from Google Console.

## Step 5: Restart Both Servers

### Terminal 1 - Backend:
```powershell
cd C:\wamp64\www\Web2\2Proj\MERN\backend
npm start
```

### Terminal 2 - Frontend:
```powershell
cd C:\wamp64\www\Web2\2Proj\MERN\frontend
npm run dev
```

## Step 6: Test Google Sign-In

1. Open http://localhost:5173/login
2. Click "Sign in with Google"
3. Select your Google account
4. Authorize the application
5. You should be redirected back and logged in

## Troubleshooting

### Error: redirect_uri_mismatch
- Make sure the redirect URI in Google Console exactly matches: `http://localhost:5001/api/auth/google/callback`
- No trailing slash, exact match required

### Error: Error 401
- Check that your Client ID and Client Secret are correct in .env
- Make sure there are no extra spaces in the .env values

### Error: Cannot find module 'passport'
- Run: `npm install` in the backend directory
- Make sure all packages are installed

### Session not working
- Clear browser cookies and cache
- Try in incognito/private mode
- Check that express-session is properly configured

### User data not saving
- Check that the database migration ran successfully
- Verify the `google_id` column exists in the `guests` table
- Check backend console for errors

## Files Modified/Created

### Backend:
- ✅ `backend/config/passport.js` - Passport Google strategy configuration
- ✅ `backend/routes/auth.js` - Added Google OAuth routes
- ✅ `backend/models/User.js` - Added google_id field
- ✅ `backend/server.js` - Added passport and session middleware
- ✅ `backend/migrations/add_google_id_to_guests.sql` - Database migration
- ✅ `backend/.env` - Added Google OAuth environment variables

### Frontend:
- ✅ `frontend/src/pages/GoogleAuthCallback.jsx` - OAuth callback handler
- ✅ `frontend/src/pages/LoginPage.jsx` - Updated Google button link
- ✅ `frontend/src/App.jsx` - Added callback route

## Security Notes for Production

When deploying to production:
1. Update redirect URIs in Google Console to use HTTPS and production domain
2. Update environment variables with production URLs
3. Enable secure cookies (already configured based on NODE_ENV)
4. Consider adding rate limiting to OAuth endpoints
5. Add proper error logging and monitoring
