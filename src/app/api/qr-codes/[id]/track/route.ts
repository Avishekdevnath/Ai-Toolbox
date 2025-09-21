import { NextRequest, NextResponse } from 'next/server';
import { QRCodeModel } from '@/models/QRCodeModel';
import { z } from 'zod';

const TrackEventSchema = z.object({
  action: z.enum(['scan', 'download', 'share']),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  device: z.string().optional(),
  referer: z.string().optional(),
  platform: z.string().optional(),
  method: z.string().optional(),
  format: z.string().optional()
});

// POST /api/qr-codes/[id]/track - Track QR code events
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validationResult = TrackEventSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { action, ...eventData } = validationResult.data;
    
    // Get additional data from request headers
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     eventData.ipAddress || 'unknown';
    const userAgent = request.headers.get('user-agent') || eventData.userAgent || 'unknown';
    
    const trackingData = {
      ...eventData,
      ipAddress,
      userAgent
    };

    let success = false;

    switch (action) {
      case 'scan':
        success = await QRCodeModel.trackScan(params.id, trackingData);
        break;
      case 'download':
        success = await QRCodeModel.trackDownload(params.id, trackingData);
        break;
      case 'share':
        success = await QRCodeModel.trackShare(params.id, trackingData);
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    if (!success) {
      return NextResponse.json({ error: 'Failed to track event' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Event tracked successfully'
    });
  } catch (error) {
    console.error('Error tracking QR code event:', error);
    return NextResponse.json(
      { error: 'Failed to track event' },
      { status: 500 }
    );
  }
}
