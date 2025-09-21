import { NextRequest, NextResponse } from 'next/server';
import { getCodeSnippetModel } from '@/models/CodeSnippetModel';
import mongoose from 'mongoose';

async function findSnippet(slug: string) {
  const Snippet = await getCodeSnippetModel();
  return Snippet.findOne({ slug });
}

// GET /api/snippets/:slug – public read
export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  const { slug } = await params;
  const snippet = await findSnippet(slug);
  if (!snippet || !snippet.isPublic) {
    return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
  }
  snippet.viewCount += 1;
  await snippet.save();
  return NextResponse.json({ success: true, data: snippet });
}

// PUT /api/snippets/:slug – owner update (same as PATCH for now)
export async function PUT(request: NextRequest, { params }: { params: { slug: string } }) {
  const { slug } = await params;
  return PATCH(request, { params: { slug } });
}

// PATCH /api/snippets/:slug – owner update
export async function PATCH(request: NextRequest, { params }: { params: { slug: string } }) {
  const { slug } = await params;
  const snippet = await findSnippet(slug);
  if (!snippet) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
  const userId = request.headers.get('x-user-id');

  // Ownership / permission logic
  if (snippet.ownerId) {
    if (!userId || String(snippet.ownerId) !== userId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }
  } else {
    // Unclaimed snippet: if user is logged-in, claim ownership; otherwise allow anonymous edit
    if (userId) snippet.ownerId = new mongoose.Types.ObjectId(userId);
  }
  const body = await request.json();
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
