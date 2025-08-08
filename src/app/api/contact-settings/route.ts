import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ContactSettingsModel } from '@/models';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    // Get current contact settings
    const settings = await ContactSettingsModel.findOne();
    
    if (!settings) {
      return NextResponse.json({ 
        success: true, 
        settings: null 
      });
    }

    // Return only active contact methods and features
    const activeSettings = {
      contactMethods: settings.contactMethods
        .filter(method => method.isActive)
        .sort((a, b) => a.order - b.order),
      pageTitle: settings.pageTitle,
      pageDescription: settings.pageDescription,
      features: settings.features
        .filter(feature => feature.isActive)
        .sort((a, b) => a.order - b.order),
      additionalInfo: settings.additionalInfo.isActive ? settings.additionalInfo : null
    };

    return NextResponse.json({ 
      success: true, 
      settings: activeSettings 
    });

  } catch (error) {
    console.error('Error fetching contact settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contact settings' }, 
      { status: 500 }
    );
  }
} 