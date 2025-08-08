import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { ShortenedUrlModel } from '@/schemas/urlShortenerSchema';
import { getAnonymousUserSession } from '@/lib/urlShortenerUtils';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Get user session
    const { anonymousUserId } = getAnonymousUserSession(request);

    // Connect to database
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    // Find the URL and ensure it belongs to the current user
    const url = await ShortenedUrlModel.findOne({
      _id: id,
      anonymousUserId
    });

    if (!url) {
      return NextResponse.json(
        { error: 'URL not found or you do not have permission to delete it' },
        { status: 404 }
      );
    }

    // Delete the URL
    await ShortenedUrlModel.deleteOne({ _id: id });

    return NextResponse.json({
      success: true,
      message: 'URL deleted successfully'
    });

  } catch (error: any) {
    console.error('Error deleting URL:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 