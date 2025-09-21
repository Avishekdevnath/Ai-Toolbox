import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth/jwt';
import { cookies } from 'next/headers';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('user_session')?.value;
    const claims = token ? verifyAccessToken(token) : null;
    const userId = claims?.id;
    const { id } = await params;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has admin role
    const isAdmin = claims?.role === 'admin' || claims?.role === 'super_admin';

    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }
    
    const db = await getDatabase();
    const tool = await db.collection('tools').findOne({ _id: new ObjectId(id) });
    
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('user_session')?.value;
    const claims = token ? verifyAccessToken(token) : null;
    const userId = claims?.id;
    const { id } = await params;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has admin role
    const isAdmin = claims?.role === 'admin' || claims?.role === 'super_admin';

    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }
    
    const body = await request.json();
    const db = await getDatabase();
    
    const result = await db.collection('tools').updateOne(
      { _id: new ObjectId(id) },
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('user_session')?.value;
    const claims = token ? verifyAccessToken(token) : null;
    const userId = claims?.id;
    const { id } = await params;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has admin role
    const isAdmin = claims?.role === 'admin' || claims?.role === 'super_admin';

    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }
    
    const db = await getDatabase();
    const result = await db.collection('tools').deleteOne({ _id: new ObjectId(id) });
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Tool not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting tool:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 