# Email Troubleshooting Guide

## 🚨 **Issue: Not receiving emails from Clerk**

### **Step 1: Use the Debug Tool**
Visit: `http://localhost:3000/email-debug`

This tool will help you:
- Test email sending functionality
- Check environment variables
- Get detailed error messages

### **Step 2: Check Clerk Dashboard Settings**

1. **Go to Clerk Dashboard**: https://dashboard.clerk.com
2. **Navigate to**: User & Authentication → Email, SMS, Phone
3. **Check these settings**:

#### **Email Address Settings:**
- ✅ **"Verify at sign-up"** should be **ON** (which you have)
- ✅ **"Email verification code"** should be **ON** (which you have)
- ❌ **"Email verification link"** should be **OFF** (which you have)

#### **Email Templates:**
- Go to **Email Templates** section
- Check if **"Email verification"** template exists
- Verify the template content is not empty

#### **Domain Settings:**
- Check if your domain is properly configured
- Look for any domain verification issues

### **Step 3: Test with Different Email Providers**

Try these email addresses for testing:
- **Gmail**: `yourname@gmail.com` (most reliable)
- **Outlook**: `yourname@outlook.com`
- **Yahoo**: `yourname@yahoo.com`

### **Step 4: Check Spam/Junk Folders**

1. **Check Spam folder** in your email client
2. **Check Junk folder** if using Outlook
3. **Search for "Clerk"** in your email
4. **Search for "verification"** in your email

### **Step 5: Environment Variables Check**

Make sure these are set in your `.env.local`:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

### **Step 6: Common Solutions**

#### **Solution 1: Use Gmail for Testing**
- Gmail is most reliable for receiving Clerk emails
- Some email providers block Clerk's emails

#### **Solution 2: Check Email Template**
- In Clerk Dashboard, go to Email Templates
- Make sure the verification template is properly configured

#### **Solution 3: Domain Configuration**
- If using a custom domain, ensure it's properly configured
- Check for any DNS issues

#### **Solution 4: Restart Development Server**
```bash
# Stop the server (Ctrl+C)
# Then restart
npm run dev
```

### **Step 7: Alternative Testing**

If emails still don't work:

1. **Use the Simple Sign-Up Page**: `http://localhost:3000/sign-up-simple`
2. **Check Console Logs**: Open browser dev tools and look for errors
3. **Try OAuth Sign-Up**: Use Google/GitHub sign-up instead

### **Step 8: Contact Clerk Support**

If nothing works:
1. Go to https://clerk.com/support
2. Provide your Clerk instance details
3. Include the error messages from the debug tool

## 🔧 **Quick Commands**

```bash
# Check if server is running
npm run dev

# Check environment variables
echo $NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
echo $CLERK_SECRET_KEY

# Restart server
npm run dev
```

## 📞 **Need Help?**

1. **Use the debug tool**: `http://localhost:3000/email-debug`
2. **Check this guide**: Follow the steps above
3. **Try Gmail**: Most reliable for testing
4. **Contact support**: If issues persist 