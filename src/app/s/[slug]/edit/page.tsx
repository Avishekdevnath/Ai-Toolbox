import { getCodeSnippetModel } from '@/models/CodeSnippetModel';
import { notFound } from 'next/navigation';
import SnippetEditor from '@/components/snippets/SnippetEditor';
import EditSnippetClient from './EditSnippetClient';

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

    return <EditSnippetClient snippet={snippet} />;
  } catch (error) {
    console.error('Error fetching snippet:', error);
    notFound();
  }
}
