# Test Google OAuth Setup

To test Google OAuth without setting up actual credentials, you can temporarily update your `.env.local` file with these test values:

```bash
# Temporary test values (replace with real ones from Google Cloud Console)
GOOGLE_CLIENT_ID=123456789012-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnopqrstuvwxyz123456
```

**Important:** These are fake credentials and won't actually work for sign-in, but they will show you how the UI looks with Google OAuth enabled.

For real Google OAuth:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project and enable Google+ API
3. Create OAuth 2.0 credentials
4. Add `http://localhost:3000/api/auth/callback/google` as a redirect URI
5. Replace the test values above with your real Client ID and Secret

## Quick Test

1. Update `.env.local` with the test values above
2. Restart your dev server: `npm run dev`
3. Go to `/auth/signin` to see both Google and Demo sign-in options
4. Use Demo sign-in for actual testing (Google won't work with fake credentials)
