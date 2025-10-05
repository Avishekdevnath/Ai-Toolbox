import { NextRequest, NextResponse } from 'next/server';
import { getAboutInfoModel } from '@/models/AboutInfoModel';
import { AdminAuthService } from '@/lib/adminAuthService';

export async function GET() {
  try {
    const Model = await getAboutInfoModel();
    const doc = await Model.findOne({}).lean();
    return NextResponse.json({ success: true, data: doc || {} });
  } catch (error) {
    console.error('Error fetching about info:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch about info' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const admin = await AdminAuthService.getAdminSession();
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    console.log('About info update request:', { bodyKeys: Object.keys(body) });
    
    const Model = await getAboutInfoModel();
    
    // Validate required fields
    if (!body.name || !body.title || !body.description || !body.email || !body.phone || !body.location || !body.portfolioUrl) {
      const missingFields = [];
      if (!body.name) missingFields.push('name');
      if (!body.title) missingFields.push('title');
      if (!body.description) missingFields.push('description');
      if (!body.email) missingFields.push('email');
      if (!body.phone) missingFields.push('phone');
      if (!body.location) missingFields.push('location');
      if (!body.portfolioUrl) missingFields.push('portfolioUrl');
      
      console.log('Missing required fields:', missingFields);
      return NextResponse.json({ 
        success: false, 
        error: `Missing required fields: ${missingFields.join(', ')}` 
      }, { status: 400 });
    }

    console.log('Updating about info...');
    const doc = await Model.findOneAndUpdate({}, body, { upsert: true, new: true });
    console.log('About info updated successfully');
    
    return NextResponse.json({ success: true, data: doc });
  } catch (error) {
    console.error('Error updating about info:', error);
    return NextResponse.json({ 
      success: false, 
      error: `Failed to update about info: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const admin = await AdminAuthService.getAdminSession();
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const Model = await getAboutInfoModel();
    
    // Check if about info already exists
    const existing = await Model.findOne({});
    if (existing) {
      return NextResponse.json({ 
        success: false, 
        error: 'About info already exists. Use PUT to update.' 
      }, { status: 400 });
    }

    const doc = await Model.create(body);
    return NextResponse.json({ success: true, data: doc });
  } catch (error) {
    console.error('Error creating about info:', error);
    return NextResponse.json({ success: false, error: 'Failed to create about info' }, { status: 500 });
  }
}
