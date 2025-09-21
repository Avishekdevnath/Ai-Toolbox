import { redirect } from 'next/navigation';
import { getCodeSnippetModel } from '@/models/CodeSnippetModel';
import { nanoid } from 'nanoid';

export const dynamic = 'force-dynamic';

export default async function NewSnippetRedirect() {
  try {
    const Snippet = await getCodeSnippetModel();
    const slug = nanoid(8);
    
    // Create a new snippet with unique slug immediately
    await Snippet.create({ 
      slug, 
      language: 'javascript', 
      content: '', 
      isPublic: true 
    });
    
    // Redirect to edit page with the new slug
    redirect(`/s/${slug}/edit`);
  } catch (error) {
    console.error('Error creating new snippet:', error);
    // Fallback: redirect to a generic new snippet page
    redirect('/s/new/edit');
  }
}
