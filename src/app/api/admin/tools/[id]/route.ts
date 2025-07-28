import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Add proper admin role checking
    // For now, just check if user is authenticated
    
    const db = await getDatabase();
    const tool = await db.collection('tools').findOne({ _id: new ObjectId(params.id) });
    
    if (!tool) {
      return NextResponse.json({ error: 'Tool not found' }, { status: 404 });
    }
    
    return NextResponse.json({ tool });
  } catch (error) {
    console.error('Error fetching tool:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Add proper admin role checking
    // For now, just check if user is authenticated
    
    const body = await request.json();
    const db = await getDatabase();
    
    const result = await db.collection('tools').updateOne(
      { _id: new ObjectId(params.id) },
      { $set: body }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Tool not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating tool:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Add proper admin role checking
    // For now, just check if user is authenticated
    
    const db = await getDatabase();
    const result = await db.collection('tools').deleteOne({ _id: new ObjectId(params.id) });
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Tool not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting tool:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 