import { NextRequest, NextResponse } from 'next/server';
import { getAuthCookie } from '@/lib/auth/cookies';
import { verifyAccessToken } from '@/lib/auth/jwt';
import { uploadToCloudinary, deleteFromCloudinary } from '@/lib/cloudinary';
import { connectToDatabase } from '@/lib/mongodb';
import { AuthUserModel } from '@/models/AuthUserModel';

export async function POST(request: NextRequest) {
  try {
    console.log('📸 Profile picture upload started');
    
    // Check Cloudinary configuration
    if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 
        !process.env.CLOUDINARY_API_KEY || 
        !process.env.CLOUDINARY_API_SECRET) {
      console.error('❌ Cloudinary not configured');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cloudinary is not configured. Please set environment variables.' 
        },
        { status: 500 }
      );
    }
    
    // Verify authentication
    const token = await getAuthCookie();
    const claims = token ? verifyAccessToken(token) : null;
    
    if (!claims || (claims.role !== 'admin' && claims.role !== 'super_admin')) {
      console.error('❌ Unauthorized access attempt');
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    console.log('✅ User authenticated:', claims.id);

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    console.log('📄 File received:', file ? file.name : 'none');
    
    if (!file) {
      console.error('❌ No file in request');
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      console.error('❌ Invalid file type:', file.type);
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Please upload an image.' },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      console.error('❌ File too large:', file.size);
      return NextResponse.json(
        { success: false, error: 'File size exceeds 5MB limit' },
        { status: 400 }
      );
    }
    
    console.log('✅ File validation passed');

    // Convert file to buffer
    console.log('🔄 Converting file to buffer...');
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    console.log('✅ Buffer created:', buffer.length, 'bytes');

    // Connect to database
    console.log('🔄 Connecting to database...');
    await connectToDatabase();
    console.log('✅ Database connected');

    // Get current user to check for existing profile picture
    console.log('🔄 Fetching user:', claims.id);
    const user = await AuthUserModel.findById(claims.id);
    if (!user) {
      console.error('❌ User not found:', claims.id);
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    console.log('✅ User found:', user.email);

    // Delete old profile picture if exists
    if (user.profilePicture?.cloudinaryPublicId) {
      try {
        console.log('🗑️ Deleting old picture:', user.profilePicture.cloudinaryPublicId);
        await deleteFromCloudinary(user.profilePicture.cloudinaryPublicId);
        console.log('✅ Old picture deleted');
      } catch (error) {
        console.error('⚠️ Error deleting old profile picture:', error);
        // Continue even if deletion fails
      }
    }

    // Upload to Cloudinary with user ID as public ID
    console.log('☁️ Uploading to Cloudinary...');
    const uploadResult = await uploadToCloudinary(
      buffer,
      'profile-pictures',
      `user_${claims.id}`
    );
    console.log('✅ Upload successful:', uploadResult.url);

    // Update user profile picture in database
    console.log('💾 Updating database...');
    user.profilePicture = {
      url: uploadResult.url,
      cloudinaryPublicId: uploadResult.publicId,
      uploadedAt: new Date()
    };
    await user.save();
    console.log('✅ Database updated');

    return NextResponse.json({
      success: true,
      data: {
        url: uploadResult.url,
        message: 'Profile picture updated successfully'
      }
    });

  } catch (error: any) {
    console.error('❌ Error uploading profile picture:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to upload profile picture',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Verify authentication
    const token = await getAuthCookie();
    const claims = token ? verifyAccessToken(token) : null;
    
    if (!claims || (claims.role !== 'admin' && claims.role !== 'super_admin')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Get current user
    const user = await AuthUserModel.findById(claims.id);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Delete from Cloudinary if exists
    if (user.profilePicture?.cloudinaryPublicId) {
      try {
        await deleteFromCloudinary(user.profilePicture.cloudinaryPublicId);
      } catch (error) {
        console.error('Error deleting from Cloudinary:', error);
      }
    }

    // Remove profile picture from database
    user.profilePicture = undefined;
    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Profile picture deleted successfully'
    });

  } catch (error: any) {
    console.error('Error deleting profile picture:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to delete profile picture' 
      },
      { status: 500 }
    );
  }
}

