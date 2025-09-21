import html2canvas from 'html2canvas';

export const downloadCodeAsImage = async (elementId: string, filename: string = 'code-snippet') => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Code element not found');
    }

    // Configure html2canvas options for better code rendering
    const canvas = await html2canvas(element, {
      backgroundColor: '#111827', // Dark background
      scale: 2, // Higher resolution
      useCORS: true,
      allowTaint: true,
      width: element.scrollWidth,
      height: element.scrollHeight,
      scrollX: 0,
      scrollY: 0,
    });

    // Create download link
    const link = document.createElement('a');
    link.download = `${filename}.png`;
    link.href = canvas.toDataURL('image/png');
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return true;
  } catch (error) {
    console.error('Error downloading code as image:', error);
    return false;
  }
};

export const downloadCodeAsSVG = (elementId: string, filename: string = 'code-snippet') => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Code element not found');
    }

    // Get the code content and language
    const codeElement = element.querySelector('code');
    const language = element.querySelector('.language-label')?.textContent || 'text';
    
    if (!codeElement) {
      throw new Error('Code content not found');
    }

    const code = codeElement.textContent || '';
    const lines = code.split('\n');
    const maxLineLength = Math.max(...lines.map(line => line.length));
    
    // Calculate dimensions
    const charWidth = 8;
    const lineHeight = 20;
    const padding = 20;
    const width = Math.max(400, maxLineLength * charWidth + padding * 2);
    const height = lines.length * lineHeight + padding * 2;

    // Create SVG
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <style>
            .background { fill: #111827; }
            .text { fill: #f9fafb; font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace; font-size: 14px; }
            .line-number { fill: #6b7280; }
            .language-label { fill: #3b82f6; font-weight: bold; }
          </style>
        </defs>
        <rect class="background" width="100%" height="100%"/>
        <text x="10" y="20" class="language-label">${language.toUpperCase()}</text>
        ${lines.map((line, index) => `
          <text x="10" y="${40 + index * lineHeight}" class="text">${line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</text>
        `).join('')}
      </svg>
    `;

    // Create download link
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `${filename}.svg`;
    link.href = url;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Error downloading code as SVG:', error);
    return false;
  }
};
