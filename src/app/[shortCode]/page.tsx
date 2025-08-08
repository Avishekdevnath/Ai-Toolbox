import mongoose from 'mongoose';
import { ShortenedUrlModel } from '@/schemas/urlShortenerSchema';
import { notFound } from 'next/navigation';
import RedirectPage from './RedirectPage';

interface PageProps {
  params: Promise<{ shortCode: string }>;
}

export default async function ShortCodePage({ params }: PageProps) {
  const { shortCode } = await params;

  try {
    // Connect to database
    if (mongoose.connection.readyState !== 1) {
      console.log('🔍 Connecting to database...');
      await mongoose.connect(process.env.MONGODB_URI!);
      console.log('✅ Database connected');
    } else {
      console.log('✅ Database already connected');
    }

    console.log('🔍 Looking for short code:', shortCode);

    // First try a simple query without filters
    let urlData = await ShortenedUrlModel.findOne({
      shortCode
    }).lean();

    console.log('🔍 Simple query result:', urlData ? 'Found' : 'Not found');

    // If not found, try with active filter
    if (!urlData) {
      urlData = await ShortenedUrlModel.findOne({
        shortCode,
        isActive: true
      }).lean();
      
      console.log('🔍 Active query result:', urlData ? 'Found' : 'Not found');
    }

    // If still not found, try without any filters to see if any URLs exist
    if (!urlData) {
      const anyUrl = await ShortenedUrlModel.findOne({}).lean();
      console.log('🔍 Any URL in collection:', anyUrl ? 'Yes' : 'No');
      if (anyUrl) {
        console.log('🔍 Sample URL shortCode:', anyUrl.shortCode);
      }
    }

    console.log('🔍 Found URL data:', urlData ? 'Yes' : 'No');

    if (!urlData) {
      console.log('❌ URL not found for short code:', shortCode);
      notFound();
    }

    console.log('✅ URL found, redirecting to:', urlData.originalUrl);

    // Increment click count
    await ShortenedUrlModel.updateOne(
      { _id: urlData._id },
      { 
        $inc: { clicks: 1 },
        $set: { updatedAt: new Date() }
      }
    );

    // Return client-side redirect component
    return <RedirectPage targetUrl={urlData.originalUrl} />;
  } catch (error) {
    console.error('Error fetching URL:', error);
    notFound();
  }
} 