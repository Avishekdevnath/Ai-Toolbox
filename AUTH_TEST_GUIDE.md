# 🔐 Authentication System Test Guide

## ✅ **Status: READY FOR TESTING**

Your authentication system has been successfully set up with:
- ✅ New admin users created in MongoDB
- ✅ JWT_SECRET configured
- ✅ Server running on http://localhost:3001
- ✅ Redirect loops fixed
- ✅ Unified authentication system implemented

## 🧪 **Test Your Authentication System**

### **🌐 Server URL:**
**http://localhost:3001**

### **🔐 Admin Accounts (Freshly Created):**

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| **Super Admin** | `superadmin@ai-toolbox.com` | `Admin123!` | Full system access |
| **Admin** | `admin@ai-toolbox.com` | `Admin123!` | Admin panel access |
| **Moderator** | `moderator@ai-toolbox.com` | `Admin123!` | Limited admin access |

### **👤 User Accounts (Freshly Created):**

| Email | Password | Role |
|-------|----------|------|
| `user@ai-toolbox.com` | `User123!` | Regular user |
| `demo@ai-toolbox.com` | `User123!` | Regular user |

## 🧪 **Step-by-Step Testing**

### **1. Test Admin Login**
1. Visit: **http://localhost:3001/admin-login**
2. Use: `admin@ai-toolbox.com` / `Admin123!`
3. **Expected**: Redirect to `/admin` dashboard
4. **Success Indicator**: You should see the admin dashboard

### **2. Test User Registration**
1. Visit: **http://localhost:3001/sign-up**
2. Fill in the form with test data
3. **Expected**: Redirect to `/overview` after successful registration
4. **Success Indicator**: You should see the user dashboard

### **3. Test User Login**
1. Visit: **http://localhost:3001/sign-in**
2. Use: `user@ai-toolbox.com` / `User123!`
3. **Expected**: Redirect to `/overview`
4. **Success Indicator**: You should see the user dashboard

### **4. Test Route Protection**
1. **Without logging in**, try accessing:
   - `http://localhost:3001/admin` → Should redirect to `/admin-login`
   - `http://localhost:3001/profile` → Should redirect to `/sign-in`
   - `http://localhost:3001/overview` → Should redirect to `/sign-in`

### **5. Test Logout**
1. Login as any user
2. Visit: `http://localhost:3001/api/auth/logout`
3. **Expected**: Redirect to home page
4. **Success Indicator**: You should be logged out

## 🔍 **API Testing with curl**

### **Test Session Endpoint:**
```bash
curl http://localhost:3001/api/auth/session
```

### **Test Admin Login API:**
```bash
curl -X POST http://localhost:3001/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ai-toolbox.com","password":"Admin123!"}'
```

### **Test User Login API:**
```bash
curl -X POST http://localhost:3001/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"user@ai-toolbox.com","password":"User123!"}'
```

### **Test Admin Verification:**
```bash
curl http://localhost:3001/api/admin/verify
```

## 🎯 **Success Criteria**

### **✅ What Should Work:**
- [ ] Admin login redirects to `/admin`
- [ ] User login redirects to `/overview`
- [ ] User registration works
- [ ] Protected routes redirect unauthenticated users
- [ ] Logout clears session
- [ ] No redirect loops
- [ ] No console errors
- [ ] No server errors

### **❌ What Should NOT Happen:**
- [ ] Infinite redirect loops
- [ ] Login failures with correct credentials
- [ ] Admin access for regular users
- [ ] User access to admin routes
- [ ] Session persistence after logout

## 🔧 **Troubleshooting**

### **If Login Fails:**
1. Check browser console for errors
2. Verify MongoDB connection
3. Check JWT_SECRET in `.env.local`
4. Restart the development server

### **If Redirect Loops Occur:**
1. Clear browser cookies
2. Check middleware configuration
3. Verify authentication state

### **If Admin Access Denied:**
1. Verify admin user exists in database
2. Check user role and permissions
3. Verify JWT token generation

## 📊 **Database Verification**

Your MongoDB database should now contain:

### **Collection: `adminusers`**
- 3 admin users (superadmin, admin, moderator)
- All with role-based permissions
- Passwords hashed with bcrypt

### **Collection: `users`**
- 2 regular users (user, demo)
- Basic user permissions
- Complete user profiles

## 🚀 **Next Steps After Testing**

1. **If everything works**: Your authentication system is ready for production
2. **If issues found**: Report specific errors for debugging
3. **For production**: Update JWT_SECRET and use environment-specific secrets
4. **For security**: Implement rate limiting and additional security measures

---

## 🎉 **Ready to Test!**

**Visit http://localhost:3001 and start testing your authentication system!**

Let me know the results of your testing, and I'll help fix any issues that arise. 