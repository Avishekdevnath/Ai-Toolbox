import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, getDatabase } from '@/lib/mongodb';
import { AuthService } from '@/lib/authService';

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication using AuthService
    const user = await AuthService.getSession(request);
    
    if (!user || !user.isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Connect to database
    await connectToDatabase();
    const dbConnection = await getDatabase();
    const db = dbConnection.db;

    // Get tools from the tools collection or return mock data
    const tools = await db.collection('tools').find({}).toArray();

    // If no tools in database, return mock data
    const mockTools = [
      {
        _id: '1',
        slug: 'age-calculator',
        name: 'Age Calculator',
        description: 'Calculate age from birth date',
        status: 'active',
        usage: 1250,
        successRate: 98.5,
        avgResponseTime: 245,
        lastUpdated: new Date().toISOString(),
        config: {
          rateLimit: 100,
          maxRequests: 1000,
          timeout: 5000
        }
      },
      {
        _id: '2',
        slug: 'password-generator',
        name: 'Password Generator',
        description: 'Generate secure passwords',
        status: 'active',
        usage: 890,
        successRate: 99.2,
        avgResponseTime: 180,
        lastUpdated: new Date().toISOString(),
        config: {
          rateLimit: 50,
          maxRequests: 500,
          timeout: 3000
        }
      },
      {
        _id: '3',
        slug: 'qr-generator',
        name: 'QR Generator',
        description: 'Generate QR codes',
        status: 'active',
        usage: 650,
        successRate: 97.8,
        avgResponseTime: 320,
        lastUpdated: new Date().toISOString(),
        config: {
          rateLimit: 75,
          maxRequests: 750,
          timeout: 4000
        }
      },
      {
        _id: '4',
        slug: 'unit-converter',
        name: 'Unit Converter',
        description: 'Convert between different units',
        status: 'maintenance',
        usage: 420,
        successRate: 95.1,
        avgResponseTime: 280,
        lastUpdated: new Date().toISOString(),
        config: {
          rateLimit: 60,
          maxRequests: 600,
          timeout: 3500
        }
      }
    ];

    const result = tools.length > 0 ? tools : mockTools;

    return NextResponse.json({
      success: true,
      tools: result
    });

  } catch (error) {
    console.error('Services tools API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 