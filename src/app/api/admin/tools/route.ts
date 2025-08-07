import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    const user = await currentUser();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has admin role
    const isAdmin = user?.publicMetadata?.role === 'admin' || 
                    user?.emailAddresses?.some(email => 
                      email.emailAddress === 'avishekdevnathavi@gmail.com'
                    );

    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }
    
    const db = await getDatabase();
    const tools = await db.collection('tools').find({}).toArray();
    
    return NextResponse.json({ tools });
  } catch (error) {
    console.error('Error fetching tools:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const data = await req.json();
    // Validate required fields (customize as needed)
    const requiredFields = ['name', 'slug', 'description', 'category', 'icon'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }
    const db = await getDatabase();
    // Set default values
    const tool = {
      ...data,
      status: data.status || 'active',
      usage: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await db.collection('tools').insertOne(tool);
    return NextResponse.json({ success: true, tool: { ...tool, _id: result.insertedId } });
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { id, status } = await req.json();
    if (!id || !status) {
      return NextResponse.json({ error: 'Missing id or status' }, { status: 400 });
    }
    const db = await getDatabase();
    let result = await db.collection('tools').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { status } },
      { returnDocument: 'after' }
    );
    if (!result.value) {
      // TODO: Remove this fallback after all _id fields are ObjectId in the DB
      result = await db.collection('tools').findOneAndUpdate(
        { _id: id },
        { $set: { status } },
        { returnDocument: 'after' }
      );
    }
    if (!result.value) {
      return NextResponse.json({ error: 'Tool not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, tool: result.value });
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
} 