import { redirect } from 'next/navigation';
import { getDatabase } from '@/lib/mongodb';
import { isUrlExpired } from '@/lib/urlShortenerUtils';

export default async function ShortCodeRedirectPage({ params }: { params: { shortCode: string } }) {
  const { shortCode } = await params;
  const db = await getDatabase();
  const url = await db.collection('shortened_urls').findOne({ shortCode, isActive: true });

  if (!url || isUrlExpired(url)) {
    // Not found or expired
    return <div style={{ padding: 40, textAlign: 'center' }}><h1>Link not found or expired</h1></div>;
  }

  // Track click
  await db.collection('shortened_urls').updateOne(
    { shortCode },
    { $inc: { clicks: 1 } }
  );

  // Redirect
  redirect(url.originalUrl);
  return null;
} 