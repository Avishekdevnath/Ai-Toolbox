import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectToDatabase, getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'No token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    
    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    if (!decoded || !decoded.isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Invalid admin token' },
        { status: 401 }
      );
    }

    // Connect to database and verify admin exists
    await connectToDatabase();
    const dbConnection = await getDatabase();
    
    if (!dbConnection || !dbConnection.db) {
      console.error('Database connection failed');
      return NextResponse.json(
        { success: false, error: 'Database connection failed' },
        { status: 500 }
      );
    }

    const db = dbConnection.db;
    console.log('Database connection successful, checking admin user...');

    const adminUser = await db.collection('adminusers').findOne({ 
      _id: new ObjectId(decoded.id),
      isActive: true 
    });

    if (!adminUser) {
      return NextResponse.json(
        { success: false, error: 'Admin user not found or inactive' },
        { status: 401 }
      );
    }

    console.log('Admin user verified successfully:', adminUser.email);

    return NextResponse.json({
      success: true,
      role: adminUser.role,
      email: adminUser.email,
      permissions: adminUser.permissions,
      isAdmin: true
    });

  } catch (error) {
    console.error('Admin verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Token verification failed' },
      { status: 401 }
    );
  }
} 