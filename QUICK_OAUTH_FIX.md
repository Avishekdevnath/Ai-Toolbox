# 🚨 Quick OAuth Fix Guide

## **Current Issues:**
1. ❌ `CLERK_SECRET_KEY` is missing from environment variables
2. ❌ OAuth providers (Google, GitHub) are not configured in Clerk dashboard

## **Step 1: Fix Environment Variables**

### **Option A: Use the Setup Script**
```bash
node setup-clerk-env.js
```

### **Option B: Manual Setup**
1. Open `.env.local` file
2. Add your Clerk Secret Key:
   ```env
   CLERK_SECRET_KEY=sk_test_your_secret_key_here
   ```
3. Make sure your Publishable Key is set:
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
   ```

## **Step 2: Get Your Clerk Keys**

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Select your application
3. Go to **API Keys** in the sidebar
4. Copy both:
   - **Publishable Key** (starts with `pk_test_`)
   - **Secret Key** (starts with `sk_test_`)

## **Step 3: Configure OAuth Providers**

### **3.1 In Clerk Dashboard:**
1. Go to **User & Authentication** → **Social Connections**
2. Click **"Add connection"**
3. Add **Google** and **GitHub**

### **3.2 For Google OAuth:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Google+ API** or **Google Identity API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client IDs**
5. Configure OAuth consent screen
6. Set **Authorized redirect URIs** to:
   ```
   https://your-clerk-domain.clerk.accounts.dev/v1/oauth/google/callback
   ```
7. Copy **Client ID** and **Client Secret**
8. Add them to Clerk dashboard Google OAuth settings

### **3.3 For GitHub OAuth:**
1. Go to [GitHub Settings](https://github.com/settings/developers)
2. Click **"New OAuth App"**
3. Set **Authorization callback URL** to:
   ```
   https://your-clerk-domain.clerk.accounts.dev/v1/oauth/github/callback
   ```
4. Copy **Client ID** and **Client Secret**
5. Add them to Clerk dashboard GitHub OAuth settings

## **Step 4: Add Redirect URLs**

In Clerk dashboard, add these redirect URLs:
```
http://localhost:3000/sso-callback
http://localhost:3000/sign-in
http://localhost:3000/sign-up
```

## **Step 5: Test**

1. **Restart your development server**
2. Visit `http://localhost:3000/clerk-diagnostic`
3. Verify all checks pass ✅
4. Test OAuth at `http://localhost:3000/oauth-test`

## **🔍 How to Find Your Clerk Domain**

1. In Clerk Dashboard, go to **Domains**
2. Your domain will be something like: `artistic-lemming-1.clerk.accounts.dev`
3. Use this in the OAuth callback URLs

## **✅ Success Checklist**

- [ ] Environment variables set (both keys)
- [ ] Google OAuth app created and configured
- [ ] GitHub OAuth app created and configured
- [ ] OAuth credentials added to Clerk dashboard
- [ ] Redirect URLs added to Clerk dashboard
- [ ] Development server restarted
- [ ] Diagnostic page shows all ✅
- [ ] OAuth test page works

## **🚨 If Still Not Working**

1. **Check browser console** for errors
2. **Verify OAuth app settings** match exactly
3. **Ensure redirect URLs** are correct
4. **Check Clerk dashboard** for any error messages
5. **Try clearing browser cache** and cookies

---

**Need help?** Visit the full setup guide at `http://localhost:3000/oauth-setup-guide` 