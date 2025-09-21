import { NextRequest, NextResponse } from 'next/server';
import { QRCodeModel } from '@/models/QRCodeModel';
import { CreateQRCodeRequest, QRCodeSearchFilters } from '@/schemas/qrCodeSchema';
import { verifyAccessToken } from '@/lib/auth/jwt';
import { z } from 'zod';

// GET /api/qr-codes - Get user's QR codes with optional filtering
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('user_session')?.value;
    const claims = token ? verifyAccessToken(token) : null;
    
    if (!claims) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const filters: QRCodeSearchFilters = {
      query: searchParams.get('query') || undefined,
      type: searchParams.get('type') as any || undefined,
      status: searchParams.get('status') as any || undefined,
      tags: searchParams.get('tags')?.split(',').filter(Boolean) || undefined,
      dateFrom: searchParams.get('dateFrom') ? new Date(searchParams.get('dateFrom')!) : undefined,
      dateTo: searchParams.get('dateTo') ? new Date(searchParams.get('dateTo')!) : undefined,
      sortBy: (searchParams.get('sortBy') as any) || 'createdAt',
      sortOrder: (searchParams.get('sortOrder') as any) || 'desc',
      limit: parseInt(searchParams.get('limit') || '20'),
      offset: parseInt(searchParams.get('offset') || '0')
    };

    const result = await QRCodeModel.findByUser(claims.id, undefined, filters);
    
    return NextResponse.json({
      success: true,
      data: result.qrCodes,
      pagination: {
        total: result.total,
        limit: filters.limit,
        offset: filters.offset,
        hasMore: result.offset + result.qrCodes.length < result.total
      }
    });
  } catch (error) {
    console.error('Error fetching QR codes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch QR codes' },
      { status: 500 }
    );
  }
}

// POST /api/qr-codes - Create a new QR code
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('user_session')?.value;
    const claims = token ? verifyAccessToken(token) : null;
    
    if (!claims) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate request body
    const validationResult = CreateQRCodeRequest.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const qrData = validationResult.data;
    
    // Get client IP and user agent
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    // Generate device fingerprint (simplified)
    const deviceFingerprint = `${ipAddress}-${userAgent}`.replace(/[^a-zA-Z0-9-]/g, '');

    const qrCode = await QRCodeModel.create(
      qrData,
      claims.id,
      undefined,
      deviceFingerprint,
      ipAddress
    );

    return NextResponse.json({
      success: true,
      data: qrCode
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating QR code:', error);
    return NextResponse.json(
      { error: 'Failed to create QR code' },
      { status: 500 }
    );
  }
}
