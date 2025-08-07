import { getDatabase } from '@/lib/mongodb';
import { UrlShortenerModel } from '@/models/UrlShortenerModel';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ shortCode: string }>;
}

export default async function ShortCodePage({ params }: PageProps) {
  const { shortCode } = await params;

  try {
    await getDatabase();
    const urlData = await UrlShortenerModel.findByShortCode(shortCode);

    if (!urlData) {
      notFound();
    }

    // Redirect to the original URL
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Redirecting...</h1>
          <p className="text-gray-600 mb-4">
            You are being redirected to: {urlData.originalUrl}
          </p>
          <a 
            href={urlData.originalUrl} 
            className="text-blue-600 hover:underline"
          >
            Click here if you are not redirected automatically
          </a>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error fetching URL:', error);
    notFound();
  }
} 