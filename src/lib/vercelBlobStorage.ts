import { put } from '@vercel/blob';

export interface UploadedResumeBlob {
  pathname: string;
  url: string;
  downloadUrl: string;
  contentType: string;
}

function sanitizeFileName(fileName: string): string {
  return fileName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function assertBlobConfigured() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error('Vercel Blob is not configured. Set BLOB_READ_WRITE_TOKEN.');
  }
}

export async function uploadResumeToVercelBlob(file: File): Promise<UploadedResumeBlob> {
  assertBlobConfigured();

  const normalizedFileName = sanitizeFileName(file.name) || 'resume-upload';
  const blob = await put(`resumes/${normalizedFileName}`, file, {
    access: 'private',
    addRandomSuffix: true,
    contentType: file.type || 'application/octet-stream',
  });

  return {
    pathname: blob.pathname,
    url: blob.url,
    downloadUrl: blob.downloadUrl,
    contentType: blob.contentType,
  };
}
