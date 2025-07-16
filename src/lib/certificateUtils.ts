import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export interface CertificateData {
  candidateName: string;
  position: string;
  industry: string;
  score: number;
  maxScore: number;
  percentage: number;
  grade: string;
  date: Date;
  sessionId: string;
  type?: 'mock' | 'job-specific';
}

export async function downloadCertificateAsPDF(certificateData: CertificateData): Promise<void> {
  try {
    // Wait for the certificate to be rendered
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const certificateElement = document.getElementById('certificate');
    if (!certificateElement) {
      throw new Error('Certificate element not found');
    }

    // Create canvas from the certificate
    const canvas = await html2canvas(certificateElement, {
      scale: 2, // Higher quality
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: 800,
      height: 1000
    });

    // Convert canvas to image
    const imgData = canvas.toDataURL('image/png');

    // Create PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 295; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    let position = 0;

    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add additional pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Download PDF
    const fileName = `certificate-${certificateData.sessionId}.pdf`;
    pdf.save(fileName);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF certificate');
  }
}

export async function downloadCertificateAsImage(certificateData: CertificateData): Promise<void> {
  try {
    // Wait for the certificate to be rendered
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const certificateElement = document.getElementById('certificate');
    if (!certificateElement) {
      throw new Error('Certificate element not found');
    }

    // Create canvas from the certificate
    const canvas = await html2canvas(certificateElement, {
      scale: 2, // Higher quality
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: 800,
      height: 1000
    });

    // Convert canvas to blob
    canvas.toBlob((blob) => {
      if (blob) {
        // Create download link
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `certificate-${certificateData.sessionId}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    }, 'image/png');
  } catch (error) {
    console.error('Error generating image:', error);
    throw new Error('Failed to generate image certificate');
  }
}

export function generateCertificateHTML(data: CertificateData): string {
  const dateStr = data.date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Interview Certificate</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          margin: 0;
          padding: 40px;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .certificate {
          background: white;
          padding: 60px;
          border-radius: 20px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          text-align: center;
          max-width: 800px;
          width: 100%;
          position: relative;
          border: 3px solid #1e40af;
        }
        .certificate::before {
          content: '';
          position: absolute;
          top: 20px;
          left: 20px;
          right: 20px;
          bottom: 20px;
          border: 1px solid #3b82f6;
          border-radius: 15px;
          pointer-events: none;
        }
        .header {
          border-bottom: 3px solid #3b82f6;
          padding-bottom: 30px;
          margin-bottom: 40px;
        }
        .logo {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
          border-radius: 12px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
        }
        .logo-text {
          color: white;
          font-weight: bold;
          font-size: 24px;
        }
        .title {
          font-size: 42px;
          color: #1e293b;
          margin: 0;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 2px;
        }
        .subtitle {
          font-size: 18px;
          color: #64748b;
          margin: 10px 0 0 0;
          font-style: italic;
        }
        .content {
          margin: 40px 0;
        }
        .name {
          font-size: 36px;
          color: #1e40af;
          margin: 20px 0;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .details {
          font-size: 18px;
          color: #64748b;
          line-height: 1.6;
          margin: 20px 0;
        }
        .position {
          font-size: 28px;
          color: #1e293b;
          margin: 20px 0;
          font-weight: bold;
          text-transform: uppercase;
        }
        .performance {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 40px;
          margin: 40px 0;
          padding: 30px;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          border-radius: 15px;
        }
        .grade-circle {
          width: 120px;
          height: 120px;
          border: 4px solid #3b82f6;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
        }
        .grade-text {
          font-size: 48px;
          font-weight: bold;
          color: #3b82f6;
        }
        .score-details {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        .score-item {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        .score-label {
          font-size: 16px;
          color: #64748b;
          font-weight: 500;
        }
        .score-value {
          font-size: 20px;
          font-weight: bold;
          color: #1e293b;
        }
        .footer {
          margin-top: 50px;
          padding-top: 30px;
          border-top: 2px solid #e2e8f0;
        }
        .signatures {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
        }
        .signature-line {
          width: 200px;
          height: 2px;
          background: #1e293b;
          margin: 0 auto 10px auto;
        }
        .signature-label {
          font-size: 14px;
          color: #64748b;
          margin: 0;
        }
        .info {
          font-size: 14px;
          color: #64748b;
          line-height: 1.6;
          margin: 0 0 20px 0;
        }
        .security {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #94a3b8;
        }
      </style>
    </head>
    <body>
      <div class="certificate">
        <div class="header">
          <div class="logo">
            <span class="logo-text">AI</span>
          </div>
          <h1 class="title">Certificate of Completion</h1>
          <p class="subtitle">${data.type === 'job-specific' ? 'Job-Specific Interview Assessment' : 'Mock Interview Assessment'}</p>
        </div>
        
        <div class="content">
          <p class="details">This is to certify that</p>
          <div class="name">${data.candidateName}</div>
          <p class="details">
            has successfully completed a professional interview assessment for the position of
          </p>
          <div class="position">${data.position}</div>
          <p class="details">in the ${data.industry} industry</p>
          
          <div class="performance">
            <div class="grade-circle">
              <span class="grade-text">${data.grade}</span>
            </div>
            <div class="score-details">
              <div class="score-item">
                <span class="score-label">Score:</span>
                <span class="score-value">${data.score}/${data.maxScore}</span>
              </div>
              <div class="score-item">
                <span class="score-label">Percentage:</span>
                <span class="score-value">${data.percentage}%</span>
              </div>
            </div>
          </div>
          
          <p class="details">
            Assessment Date: ${dateStr}<br>
            Certificate ID: ${data.sessionId}
          </p>
        </div>
        
        <div class="footer">
          <div class="signatures">
            <div>
              <div class="signature-line"></div>
              <p class="signature-label">AI Assessment System</p>
            </div>
            <div>
              <div class="signature-line"></div>
              <p class="signature-label">Date</p>
            </div>
          </div>
          
          <p class="info">
            This certificate is generated by AI Toolbox's advanced interview assessment system.
            The assessment evaluates technical knowledge, problem-solving abilities, and communication skills.
          </p>
          <div class="security">
            <p>Certificate ID: ${data.sessionId}</p>
            <p>Verifiable through AI Toolbox platform</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
} 