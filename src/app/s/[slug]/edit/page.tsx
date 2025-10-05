import EditSnippetClient from './EditSnippetClient';

interface EditPageProps {
  params: {
    slug: string;
  };
}

export default async function EditSnippetPage({ params }: EditPageProps) {
  const { slug } = await params;
  
  // Pass the slug to the client component to handle data fetching
  // This makes the page more resilient to database connection issues
  return (
    <EditSnippetClient
      slug={slug}
      isNew={false}
    />
  );
}
