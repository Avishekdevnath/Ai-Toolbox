import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

async function isAdmin() {
  const session = await getServerSession(authOptions);
  console.log('Session in isAdmin:', session);
  return session && session.user && session.user.role === 'admin';
}

export async function GET(req: NextRequest) {
  console.log('GET /api/admin/tools called');
  
  if (!(await isAdmin())) {
    console.log('Admin check failed');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  console.log('Admin check passed, fetching tools...');
  
  try {
    const client = await connectToDatabase();
    const db = client.db();
    const tools = await db.collection('tools').find({}).toArray();
    console.log('Tools fetched:', tools.length);
    return NextResponse.json({ tools });
  } catch (e) {
    console.error('Error fetching tools:', e);
    return NextResponse.json({ error: 'Failed to fetch tools' }, { status: 500 });
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
    const client = await connectToDatabase();
    const db = client.db();
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
    const client = await connectToDatabase();
    const db = client.db();
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