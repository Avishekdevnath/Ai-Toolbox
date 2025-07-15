import QRCode from 'qrcode';

export async function generateQRCodeDataUrl(text: string, size: number): Promise<string> {
  try {
    return await QRCode.toDataURL(text, { width: size, margin: 2 });
  } catch (err) {
    return '';
  }
} 