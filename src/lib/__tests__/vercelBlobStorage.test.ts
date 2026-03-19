const mockPut = jest.fn();

jest.mock('@vercel/blob', () => ({
  put: (...args: unknown[]) => mockPut(...args),
}), { virtual: true });

import { uploadResumeToVercelBlob } from '../vercelBlobStorage';

describe('uploadResumeToVercelBlob', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {
      ...originalEnv,
      BLOB_READ_WRITE_TOKEN: 'blob-token',
    };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('uploads resume files to a private resumes folder in Vercel Blob', async () => {
    const file = new File(['resume body'], 'Resume 2026.pdf', {
      type: 'application/pdf',
    });

    mockPut.mockResolvedValue({
      pathname: 'resumes/resume-2026-AbCdEf.pdf',
      url: 'https://blob.example/private/resumes/resume-2026-AbCdEf.pdf',
      downloadUrl: 'https://blob.example/private/resumes/resume-2026-AbCdEf.pdf?download=1',
      contentType: 'application/pdf',
    });

    const result = await uploadResumeToVercelBlob(file);

    expect(mockPut).toHaveBeenCalledWith(
      'resumes/resume-2026.pdf',
      file,
      expect.objectContaining({
        access: 'private',
        addRandomSuffix: true,
        contentType: 'application/pdf',
      })
    );
    expect(result).toEqual({
      pathname: 'resumes/resume-2026-AbCdEf.pdf',
      url: 'https://blob.example/private/resumes/resume-2026-AbCdEf.pdf',
      downloadUrl: 'https://blob.example/private/resumes/resume-2026-AbCdEf.pdf?download=1',
      contentType: 'application/pdf',
    });
  });
});
