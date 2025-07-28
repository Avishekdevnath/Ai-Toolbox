# 🔐 Clerk Authentication Setup Guide

## 📋 **Overview**
This guide will help you configure all authentication methods in Clerk for your AI Toolbox application.

## 🚀 **Step 1: Access Clerk Dashboard**
1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Sign in or create an account
3. Create a new application or select your existing one

## 🔑 **Step 2: Get Your API Keys**
1. Go to **API Keys** in the sidebar
2. Copy your **Publishable Key** and **Secret Key**
3. Add them to your `.env.local` file:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
CLERK_SECRET_KEY=sk_test_your_secret_key_here
```

## 📧 **Step 3: Configure Email Authentication**
1. Go to **User & Authentication** → **Email, Phone, Username**
2. Enable **Email address**
3. Configure settings:
   - ✅ **Require email verification**: Enabled
   - ✅ **Allow sign up**: Enabled
   - ✅ **Allow sign in**: Enabled

## 📱 **Step 4: Configure Phone Authentication**
1. In the same section, enable **Phone number**
2. Configure settings:
   - ✅ **Require phone verification**: Enabled
   - ✅ **Allow sign up**: Enabled
   - ✅ **Allow sign in**: Enabled
3. **SMS Provider**: Choose your preferred provider (Twilio, etc.)

## 👤 **Step 5: Configure Username Authentication**
1. Enable **Username**
2. Configure settings:
   - ✅ **Allow sign up**: Enabled
   - ✅ **Allow sign in**: Enabled
   - ✅ **Require username**: Optional (users can choose)

## 🔗 **Step 6: Configure OAuth Providers**

### **Google OAuth Setup:**
1. Go to **User & Authentication** → **Social Connections**
2. Click **Add connection** → **Google**
3. Configure Google OAuth:
   - **Client ID**: Your Google OAuth Client ID
   - **Client Secret**: Your Google OAuth Client Secret
   - **Redirect URLs**: Add your domain URLs
4. **Redirect URLs to add:**
   ```
   http://localhost:3000/sign-in
   http://localhost:3000/sign-up
   http://localhost:3000/sso-callback
   https://yourdomain.com/sign-in
   https://yourdomain.com/sign-up
   https://yourdomain.com/sso-callback
   ```

### **GitHub OAuth Setup:**
1. Click **Add connection** → **GitHub**
2. Configure GitHub OAuth:
   - **Client ID**: Your GitHub OAuth App Client ID
   - **Client Secret**: Your GitHub OAuth App Client Secret
3. **GitHub OAuth App Settings:**
   - **Authorization callback URL**: `https://your-clerk-domain.clerk.accounts.dev/v1/oauth/github/callback`
   - **Homepage URL**: `http://localhost:3000`

### **Facebook OAuth Setup:**
1. Click **Add connection** → **Facebook**
2. Configure Facebook OAuth:
   - **App ID**: Your Facebook App ID
   - **App Secret**: Your Facebook App Secret
3. **Facebook App Settings:**
   - **Valid OAuth Redirect URIs**: `https://your-clerk-domain.clerk.accounts.dev/v1/oauth/facebook/callback`

## 🎨 **Step 7: Customize Appearance (Optional)**
1. Go to **Appearance** in the sidebar
2. Customize:
   - **Logo**: Upload your app logo
   - **Colors**: Match your brand colors
   - **Fonts**: Choose your preferred fonts
   - **Layout**: Customize the layout

## 🔒 **Step 8: Configure Security Settings**
1. Go to **User & Authentication** → **Security**
2. Configure:
   - **Password requirements**: Set minimum length, complexity
   - **Session management**: Configure session duration
   - **Multi-factor authentication**: Enable if needed
   - **Rate limiting**: Configure sign-in attempts

## 📧 **Step 9: Email Templates (Optional)**
1. Go to **Email Templates**
2. Customize:
   - **Welcome email**: Customize the welcome message
   - **Verification email**: Customize verification emails
   - **Password reset**: Customize password reset emails

## 🧪 **Step 10: Test Your Setup**
1. Start your development server: `npm run dev`
2. Visit `http://localhost:3000/clerk-auth-test`
3. Test all authentication methods:
   - ✅ Email sign up/sign in
   - ✅ Phone sign up/sign in
   - ✅ Username sign up/sign in
   - ✅ Google OAuth
   - ✅ GitHub OAuth
   - ✅ Facebook OAuth

## 🔧 **Environment Variables Reference**

```bash
# Required
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_key_here

# Optional - for production
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

## 🚨 **Troubleshooting**

### **OAuth Not Working:**
1. Check redirect URLs in OAuth provider settings
2. Verify API keys are correct
3. Ensure domain is added to allowed origins

### **Email Not Sending:**
1. Check email provider configuration
2. Verify domain verification
3. Check spam folder

### **Phone Verification Issues:**
1. Verify SMS provider configuration
2. Check phone number format
3. Ensure SMS credits are available

## 📚 **Additional Resources**
- [Clerk Documentation](https://clerk.com/docs)
- [OAuth Provider Guides](https://clerk.com/docs/authentication/social-connections)
- [API Reference](https://clerk.com/docs/reference)

## ✅ **Checklist**
- [ ] Clerk application created
- [ ] API keys added to environment
- [ ] Email authentication configured
- [ ] Phone authentication configured
- [ ] Username authentication configured
- [ ] Google OAuth configured
- [ ] GitHub OAuth configured
- [ ] Facebook OAuth configured
- [ ] All authentication methods tested
- [ ] Custom UI components working
- [ ] Error handling implemented

---

**🎉 Congratulations! Your AI Toolbox now supports all major authentication methods!** 