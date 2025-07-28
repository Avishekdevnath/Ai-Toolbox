# 🔐 OAuth Setup Guide for Custom Clerk Authentication

## 📋 **Overview**

This guide will help you configure OAuth providers (Google and GitHub) for your custom Clerk authentication system.

## 🚀 **Step 1: Configure Clerk Dashboard**

### **1.1 Access Clerk Dashboard**
1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Select your application
3. Navigate to **User & Authentication** → **Social Connections**

### **1.2 Add OAuth Providers**
1. Click **"Add connection"**
2. Select **Google** and **GitHub**
3. For each provider, you'll need to configure:
   - Client ID
   - Client Secret
   - Redirect URLs

## 🔧 **Step 2: Configure Google OAuth**

### **2.1 Create Google OAuth App**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the **Google+ API** or **Google Identity API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client IDs**
5. Configure the OAuth consent screen
6. Create OAuth 2.0 Client ID

### **2.2 Google OAuth Settings**
- **Application type**: Web application
- **Authorized JavaScript origins**:
  ```
  http://localhost:3000
  https://yourdomain.com (for production)
  ```
- **Authorized redirect URIs**:
  ```
  https://your-clerk-domain.clerk.accounts.dev/v1/oauth/google/callback
  ```

### **2.3 Get Google Credentials**
1. Copy the **Client ID** and **Client Secret**
2. Add them to your Clerk dashboard in the Google OAuth settings

## 🔧 **Step 3: Configure GitHub OAuth**

### **3.1 Create GitHub OAuth App**
1. Go to [GitHub Settings](https://github.com/settings/developers)
2. Click **"New OAuth App"**
3. Fill in the application details:
   - **Application name**: Your app name
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `https://your-clerk-domain.clerk.accounts.dev/v1/oauth/github/callback`

### **3.2 Get GitHub Credentials**
1. Copy the **Client ID** and **Client Secret**
2. Add them to your Clerk dashboard in the GitHub OAuth settings

## 🔧 **Step 4: Configure Clerk Redirect URLs**

### **4.1 Add Redirect URLs in Clerk Dashboard**
In your Clerk dashboard, add these redirect URLs:

```
http://localhost:3000/sso-callback
http://localhost:3000/sign-in
http://localhost:3000/sign-up
```

### **4.2 Environment Variables**
Make sure your `.env.local` file includes:

```env
# Required
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_key_here

# Optional (recommended)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

## 🧪 **Step 5: Test OAuth Configuration**

### **5.1 Use the OAuth Test Page**
1. Visit `http://localhost:3000/oauth-test`
2. Test both Google and GitHub OAuth flows
3. Check browser console for any errors

### **5.2 Test Sign-In/Sign-Up Pages**
1. Visit `/sign-in` or `/sign-up`
2. Click OAuth buttons
3. Complete the authentication flow
4. Verify you're redirected back successfully

## 🐛 **Troubleshooting Common Issues**

### **Issue: "Invalid authentication flow"**
**Solution:**
- Check that redirect URLs are correctly configured in Clerk dashboard
- Verify OAuth provider settings match Clerk's callback URLs
- Ensure environment variables are set correctly

### **Issue: OAuth provider not working**
**Solution:**
- Verify Client ID and Client Secret are correct
- Check that OAuth app is properly configured
- Ensure redirect URIs match exactly

### **Issue: Redirect loop**
**Solution:**
- Check that `redirectUrlComplete` is set correctly
- Verify SSO callback page is handling the flow properly
- Ensure no conflicting redirect configurations

### **Issue: "Response: 0 not supported yet"**
**Solution:**
- This error is now fixed with the updated SSO callback page
- Ensure you're using the latest code
- Check that OAuth flow is not being manually handled

## ✅ **Verification Checklist**

### **Clerk Dashboard:**
- [ ] Google OAuth configured with Client ID and Secret
- [ ] GitHub OAuth configured with Client ID and Secret
- [ ] Redirect URLs added: `/sso-callback`, `/sign-in`, `/sign-up`
- [ ] OAuth providers are enabled

### **OAuth Providers:**
- [ ] Google OAuth app created and configured
- [ ] GitHub OAuth app created and configured
- [ ] Redirect URIs match Clerk's callback URLs
- [ ] Client IDs and Secrets are correct

### **Environment Variables:**
- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is set
- [ ] `CLERK_SECRET_KEY` is set
- [ ] Optional URL configurations are set

### **Testing:**
- [ ] OAuth test page loads without errors
- [ ] Google OAuth flow works
- [ ] GitHub OAuth flow works
- [ ] Users are redirected back successfully
- [ ] Authentication state is maintained

## 🎯 **Expected Flow**

1. **User clicks OAuth button** → Clerk redirects to OAuth provider
2. **User authenticates** → OAuth provider redirects to Clerk
3. **Clerk processes callback** → User is redirected to `/sso-callback`
4. **SSO callback page** → Detects OAuth flow and redirects to home
5. **User is authenticated** → Can access protected routes

## 📞 **Getting Help**

If you continue to experience issues:

1. **Check Clerk Documentation**: https://clerk.com/docs/authentication/social-connections
2. **Verify OAuth Provider Docs**: 
   - [Google OAuth](https://developers.google.com/identity/protocols/oauth2)
   - [GitHub OAuth](https://docs.github.com/en/developers/apps/building-oauth-apps)
3. **Use Browser DevTools**: Check console for errors
4. **Test Incrementally**: Test each OAuth provider separately

---

**🎉 Once all tests pass, your OAuth authentication is ready for production!** 