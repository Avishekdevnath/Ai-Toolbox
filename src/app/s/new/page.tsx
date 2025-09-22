import { redirect } from 'next/navigation';
import { getCodeSnippetModel } from '@/models/CodeSnippetModel';
import { nanoid } from 'nanoid';
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/auth/jwt';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export default async function NewSnippetRedirect() {
  let slug: string;
  
  try {
    // Get user ID from JWT token
    const cookieStore = await cookies();
    const token = cookieStore.get('user_session')?.value;
    const claims = token ? verifyAccessToken(token) : null;
    const userId = claims?.id;
    
    const Snippet = await getCodeSnippetModel();
    slug = nanoid(8);
    
    // Create a new snippet with unique slug immediately
    await Snippet.create({ 
      slug, 
      language: 'javascript', 
      content: '', 
      isPublic: true,
      ownerId: userId ? new mongoose.Types.ObjectId(userId) : undefined
    });
  } catch (error) {
    console.error('Error creating new snippet:', error);
    // Fallback: redirect to a generic new snippet page
    redirect('/s/new/edit');
  }
  
  // Redirect to edit page with the new slug
  redirect(`/s/${slug}/edit`);
}
