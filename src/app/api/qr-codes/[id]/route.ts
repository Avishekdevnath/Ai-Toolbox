import { NextRequest, NextResponse } from 'next/server';
import { QRCodeModel } from '@/models/QRCodeModel';
import { UpdateQRCodeRequest } from '@/schemas/qrCodeSchema';
import { verifyAccessToken } from '@/lib/auth/jwt';

// GET /api/qr-codes/[id] - Get a specific QR code
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('user_session')?.value;
    const claims = token ? verifyAccessToken(token) : null;
    
    if (!claims) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const qrCode = await QRCodeModel.findById(params.id);
    
    if (!qrCode) {
      return NextResponse.json({ error: 'QR code not found' }, { status: 404 });
    }

    // Check if user owns this QR code
    if (qrCode.userId !== claims.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      data: qrCode
    });
  } catch (error) {
    console.error('Error fetching QR code:', error);
    return NextResponse.json(
      { error: 'Failed to fetch QR code' },
      { status: 500 }
    );
  }
}

// PUT /api/qr-codes/[id] - Update a QR code
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('user_session')?.value;
    const claims = token ? verifyAccessToken(token) : null;
    
    if (!claims) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const qrCode = await QRCodeModel.findById(params.id);
    
    if (!qrCode) {
      return NextResponse.json({ error: 'QR code not found' }, { status: 404 });
    }

    // Check if user owns this QR code
    if (qrCode.userId !== claims.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    
    // Validate request body
    const validationResult = UpdateQRCodeRequest.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const updateData = validationResult.data;
    const success = await QRCodeModel.update(params.id, updateData);

    if (!success) {
      return NextResponse.json({ error: 'Failed to update QR code' }, { status: 500 });
    }

    // Return updated QR code
    const updatedQrCode = await QRCodeModel.findById(params.id);
    
    return NextResponse.json({
      success: true,
      data: updatedQrCode
    });
  } catch (error) {
    console.error('Error updating QR code:', error);
    return NextResponse.json(
      { error: 'Failed to update QR code' },
      { status: 500 }
    );
  }
}

// DELETE /api/qr-codes/[id] - Delete a QR code
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('user_session')?.value;
    const claims = token ? verifyAccessToken(token) : null;
    
    if (!claims) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const qrCode = await QRCodeModel.findById(params.id);
    
    if (!qrCode) {
      return NextResponse.json({ error: 'QR code not found' }, { status: 404 });
    }

    // Check if user owns this QR code
    if (qrCode.userId !== claims.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const success = await QRCodeModel.delete(params.id);

    if (!success) {
      return NextResponse.json({ error: 'Failed to delete QR code' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'QR code deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting QR code:', error);
    return NextResponse.json(
      { error: 'Failed to delete QR code' },
      { status: 500 }
    );
  }
}
