import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { connectToDatabase, getDatabase } from '@/lib/mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Connect to database and get connection
    await connectToDatabase();
    const dbConnection = await getDatabase();
    const db = dbConnection.db;

    // Check admin users first
    const adminUser = await db.collection('adminusers').findOne({ email });

    if (adminUser) {
      // Verify password for admin user
      const isValidPassword = await bcrypt.compare(password, adminUser.password);

      if (!isValidPassword) {
        return NextResponse.json(
          { success: false, error: 'Invalid credentials' },
          { status: 401 }
        );
      }

      if (!adminUser.isActive) {
        return NextResponse.json(
          { success: false, error: 'Account is deactivated' },
          { status: 401 }
        );
      }

      // Create JWT token for admin
      const token = jwt.sign(
        {
          userId: adminUser._id,
          email: adminUser.email,
          role: adminUser.role,
          permissions: adminUser.permissions,
          isAdmin: true
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Update last login
      await db.collection('adminusers').updateOne(
        { _id: adminUser._id },
        { 
          $set: { 
            lastLoginAt: new Date(),
            loginAttempts: 0
          } 
        }
      );

      return NextResponse.json({
        success: true,
        token,
        user: {
          id: adminUser._id,
          email: adminUser.email,
          firstName: adminUser.firstName,
          lastName: adminUser.lastName,
          role: adminUser.role,
          permissions: adminUser.permissions,
          isAdmin: true
        }
      });
    }

    // Check regular users
    const regularUser = await db.collection('users').findOne({ email });

    if (regularUser) {
      // Verify password for regular user
      const isValidPassword = await bcrypt.compare(password, regularUser.password);

      if (!isValidPassword) {
        return NextResponse.json(
          { success: false, error: 'Invalid credentials' },
          { status: 401 }
        );
      }

      if (!regularUser.isActive) {
        return NextResponse.json(
          { success: false, error: 'Account is deactivated' },
          { status: 401 }
        );
      }

      // Create JWT token for regular user
      const token = jwt.sign(
        {
          userId: regularUser._id,
          email: regularUser.email,
          role: 'user',
          isAdmin: false
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Update last login
      await db.collection('users').updateOne(
        { _id: regularUser._id },
        { 
          $set: { 
            lastLoginAt: new Date(),
            loginAttempts: 0
          } 
        }
      );

      return NextResponse.json({
        success: true,
        token,
        user: {
          id: regularUser._id,
          email: regularUser.email,
          firstName: regularUser.firstName,
          lastName: regularUser.lastName,
          role: 'user',
          isAdmin: false
        }
      });
    }

    // User not found
    return NextResponse.json(
      { success: false, error: 'Invalid credentials' },
      { status: 401 }
    );

  } catch (error) {
    console.error('Signin error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 