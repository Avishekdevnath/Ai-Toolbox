import { NextRequest, NextResponse } from 'next/server';
import { getCodeSnippetModel } from '@/models/CodeSnippetModel';
import mongoose from 'mongoose';

async function findSnippet(slug: string) {
  try {
    const Snippet = await getCodeSnippetModel();
    return Snippet.findOne({ slug });
  } catch (error) {
    console.error('Database connection error when finding snippet:', error);
    throw new Error('Database temporarily unavailable');
  }
}

// GET /api/snippets/:slug – public read
export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { slug } = await params;
    const snippet = await findSnippet(slug);
    if (!snippet || !snippet.isPublic) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }
    
    // Increment view count with error handling
    try {
      snippet.viewCount += 1;
      await snippet.save();
    } catch (saveError) {
      console.warn('Failed to update view count:', saveError);
      // Continue without updating view count
    }
    
    return NextResponse.json({ success: true, data: snippet });
  } catch (error) {
    console.error('Error in GET /api/snippets/[slug]:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Service temporarily unavailable' 
    }, { status: 503 });
  }
}

// PUT /api/snippets/:slug – owner update (same as PATCH for now)
export async function PUT(request: NextRequest, { params }: { params: { slug: string } }) {
  const { slug } = await params;
  return PATCH(request, { params: { slug } });
}

// PATCH /api/snippets/:slug – owner update
export async function PATCH(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { slug } = await params;
    const snippet = await findSnippet(slug);
    if (!snippet) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    const userId = request.headers.get('x-user-id');

    const isOwner = snippet.ownerId && userId && String(snippet.ownerId) === userId;

    const body = await request.json();
    const isChangingVisibility = body.isPublic !== undefined && body.isPublic !== snippet.isPublic;

    if (isChangingVisibility && !isOwner) {
      return NextResponse.json({
        success: false,
        error: 'Only the owner can change visibility settings',
      }, { status: 403 });
    }

    if (snippet.ownerId) {
      if (!snippet.isPublic && !isOwner) {
        return NextResponse.json({
          success: false,
          error: 'This is a private snippet. Only the owner can edit it.',
        }, { status: 403 });
      }
    } else {
      if (userId) {
        snippet.ownerId = new mongoose.Types.ObjectId(userId);
      }
    }
    
    // Update snippet fields
    if (body.title !== undefined) snippet.title = body.title;
    if (body.language !== undefined) snippet.language = String(body.language).toLowerCase();
    if (body.isPublic !== undefined) snippet.isPublic = Boolean(body.isPublic);
    if (body.content !== undefined) {
      if (body.content.length > 100000) return NextResponse.json({ success: false, error: 'Content too large' }, { status: 413 });
      snippet.content = body.content;
      snippet.rawContent = body.rawContent ?? undefined;
    }
    
    await snippet.save();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in PATCH /api/snippets/[slug]:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Service temporarily unavailable' 
    }, { status: 503 });
  }
}

// DELETE /api/snippets/:slug – owner soft-delete
export async function DELETE(request: NextRequest, { params }: { params: { slug: string } }) {
  const { slug } = await params;
  const userId = request.headers.get('x-user-id');
  if (!userId) return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
  const snippet = await findSnippet(slug);
  if (!snippet) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
  if (!snippet.ownerId || String(snippet.ownerId) !== userId) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }
  snippet.isPublic = false;
  await snippet.save();
  return NextResponse.json({ success: true });
}
