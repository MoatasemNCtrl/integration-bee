# Complete Google OAuth Setup Guide

## Step 1: Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Select "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google` (for development)
     - `https://yourdomain.com/api/auth/callback/google` (for production)

## Step 2: Update Environment Variables

1. Copy your Client ID and Client Secret from Google Cloud Console
2. Update your `.env.local` file:

```bash
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_actual_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_actual_client_secret_here
```

## Step 3: Test the Authentication

1. Restart your development server: `npm run dev`
2. Go to `http://localhost:3000/auth/signin`
3. You should now see the Google Sign-In button
4. Click it to test the OAuth flow

## Important Notes

- The redirect URI must exactly match what you set in Google Cloud Console
- Make sure your domain is authorized in Google Cloud Console
- For production, update the redirect URI to your production domain

## Security Benefits of NextAuth.js vs Direct Google API

- ✅ Automatic CSRF protection
- ✅ Secure session management
- ✅ Database integration for user persistence
- ✅ Built-in support for multiple providers
- ✅ Automatic token refresh
- ✅ Server-side session validation
