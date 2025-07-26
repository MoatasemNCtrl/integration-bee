# Google OAuth Setup Instructions

## Setting up Google OAuth for Integration Bee

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API (for basic profile information)

### 2. Create OAuth 2.0 Credentials

1. Go to **Credentials** in the Google Cloud Console
2. Click **Create Credentials** → **OAuth 2.0 Client IDs**
3. Choose **Web application** as the application type
4. Set the following configuration:

   **Name:** Integration Bee
   
   **Authorized JavaScript origins:**
   - `http://localhost:3002` (for development)
   - `https://yourdomain.com` (for production)
   
   **Authorized redirect URIs:**
   - `http://localhost:3002/api/auth/callback/google` (for development)
   - `https://yourdomain.com/api/auth/callback/google` (for production)

### 3. Configure Environment Variables

1. Copy the **Client ID** and **Client Secret** from Google Cloud Console
2. Update your `.env.local` file:

```bash
GOOGLE_CLIENT_ID=your_actual_google_client_id_here
GOOGLE_CLIENT_SECRET=your_actual_google_client_secret_here
```

### 4. Test the Setup

1. Start the development server: `npm run dev`
2. Navigate to `http://localhost:3002`
3. Click the user icon in the top right
4. Click "Sign In" and test the Google OAuth flow

### Security Notes

- Never commit your actual Google Client Secret to version control
- Use different OAuth credentials for development and production
- Consider implementing additional security measures for production deployment

### Troubleshooting

**Error: redirect_uri_mismatch**
- Ensure the redirect URI in Google Cloud Console exactly matches your application URL
- Check that you're using the correct port (3002 for this setup)

**Error: invalid_client**
- Verify your Client ID and Client Secret are correct
- Make sure the Google+ API is enabled in your project
