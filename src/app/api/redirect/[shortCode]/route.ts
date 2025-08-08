import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { ShortenedUrlModel } from '@/schemas/urlShortenerSchema';

export async function GET(
  request: NextRequest,
  { params }: { params: { shortCode: string } }
) {
  const { shortCode } = params;

  try {
    // Connect to database
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    // Find the URL
    const urlData = await ShortenedUrlModel.findOne({
      shortCode,
      isActive: true,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } }
      ]
    }).lean();

    if (!urlData) {
      return NextResponse.json(
        { error: 'URL not found or expired' },
        { status: 404 }
      );
    }

    // Increment click count
    await ShortenedUrlModel.updateOne(
      { _id: urlData._id },
      { 
        $inc: { clicks: 1 },
        $set: { updatedAt: new Date() }
      }
    );

    // Return redirect response
    return NextResponse.redirect(urlData.originalUrl, 302);
  } catch (error) {
    console.error('Redirect error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 