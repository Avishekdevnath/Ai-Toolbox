import { getCodeSnippetModel } from '@/models/CodeSnippetModel';
import { notFound } from 'next/navigation';
import SnippetEditor from '@/components/snippets/SnippetEditor';

interface EditPageProps {
  params: {
    slug: string;
  };
}

export default async function EditSnippetPage({ params }: EditPageProps) {
  const { slug } = await params;
  
  try {
    const CodeSnippet = await getCodeSnippetModel();
    const snippet = await CodeSnippet.findOne({ slug }).lean();
    
    if (!snippet) {
      notFound();
    }

    return (
      <SnippetEditor
        initialData={{
          slug: snippet.slug,
          title: snippet.title,
          language: snippet.language,
          content: snippet.content,
          isPublic: snippet.isPublic
        }}
        isNew={false}
      />
    );
  } catch (error) {
    console.error('Error fetching snippet:', error);
    notFound();
  }
}
