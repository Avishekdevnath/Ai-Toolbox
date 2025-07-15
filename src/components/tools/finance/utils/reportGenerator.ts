import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Currency } from '../context/FinanceContext';

interface ReportData {
  title: string;
  summary: string;
  details: {
    label: string;
    value: string | number;
  }[];
  recommendations?: string[];
  charts?: {
    type: 'bar' | 'pie';
    data: number[];
    labels: string[];
  }[];
}

export async function generatePDFReport(
  data: ReportData,
  currency: Currency,
  setProgress: (progress: number) => void
): Promise<Blob> {
  const doc = new jsPDF();
  let yPos = 20;
  
  // Set progress to 10%
  setProgress(10);

  // Add title
  doc.setFontSize(20);
  doc.text(data.title, 20, yPos);
  yPos += 15;

  // Add summary
  doc.setFontSize(12);
  const splitSummary = doc.splitTextToSize(data.summary, 170);
  doc.text(splitSummary, 20, yPos);
  yPos += splitSummary.length * 7 + 10;

  setProgress(30);

  // Add details table
  const tableData = data.details.map(detail => [
    detail.label,
    typeof detail.value === 'number' 
      ? `${currency.symbol}${detail.value.toLocaleString()}`
      : detail.value
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [['Item', 'Value']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [66, 133, 244] }
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;
  
  setProgress(60);

  // Add recommendations if present
  if (data.recommendations && data.recommendations.length > 0) {
    doc.setFontSize(14);
    doc.text('Recommendations:', 20, yPos);
    yPos += 10;

    doc.setFontSize(12);
    data.recommendations.forEach(recommendation => {
      doc.text('• ' + recommendation, 25, yPos);
      yPos += 7;
    });
  }

  setProgress(80);

  // Add charts if present (simplified version - in reality, you'd want to use a charting library)
  if (data.charts && data.charts.length > 0) {
    data.charts.forEach(chart => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      // Simple chart representation
      doc.setFontSize(14);
      doc.text('Chart:', 20, yPos);
      yPos += 10;

      // Draw a simple representation
      const chartWidth = 150;
      const chartHeight = 50;
      doc.rect(20, yPos, chartWidth, chartHeight);
      
      yPos += chartHeight + 15;
    });
  }

  setProgress(100);

  // Return the PDF as a blob
  return doc.output('blob');
}

export function downloadPDF(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
} 