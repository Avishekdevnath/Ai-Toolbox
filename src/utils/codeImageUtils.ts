// Using HTML5 Canvas instead of html2canvas to avoid oklch color issues

export const downloadCodeAsImage = async (elementId: string, filename: string = 'code-snippet') => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Code element not found');
    }

    // Get the code content and metadata from the element
    const snippetTitle = document.querySelector('h1.text-sm')?.textContent || 'Untitled Snippet';
    const snippetLanguage = document.querySelector('.language-label')?.textContent || 'text';
    const snippetCode = document.querySelector('code')?.textContent || '';
    
    const title = snippetTitle;
    const language = snippetLanguage;
    const code = snippetCode;
    
    console.log('Extracted data:', { title, language, code: code.substring(0, 100) + '...' });
    
    // Create canvas using HTML5 Canvas (like SWOT analysis)
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }
    
    // Set canvas size with padding
    const padding = 24;
    const lineHeight = 22;
    const charWidth = 9;
    const maxWidth = 1200;
    const minWidth = 700;
    
    // Calculate dimensions
    const lines = code.split('\n');
    const maxLineLength = Math.max(...lines.map(line => line.length));
    const canvasWidth = Math.min(maxWidth, Math.max(minWidth, maxLineLength * charWidth + padding * 2));
    const canvasHeight = lines.length * lineHeight + padding * 2 + 140; // Extra space for enhanced macOS header
    
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    
    // Background (macOS dark theme)
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // macOS window header with enhanced gradient
    const headerGradient = ctx.createLinearGradient(0, 0, 0, 50);
    headerGradient.addColorStop(0, '#3a3a3a');
    headerGradient.addColorStop(0.3, '#2d2d2d');
    headerGradient.addColorStop(1, '#1e1e1e');
    ctx.fillStyle = headerGradient;
    ctx.fillRect(0, 0, canvas.width, 50);
    
    // Add header border
    ctx.strokeStyle = '#404040';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, canvas.width, 50);
    
    // macOS window controls with enhanced styling
    const dotRadius = 7;
    const dotSpacing = 18;
    const dotY = 15;
    const controlX = 16;
    
    // Red dot with inner highlight
    ctx.fillStyle = '#ff5f57';
    ctx.beginPath();
    ctx.arc(controlX, dotY, dotRadius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = '#ff8a80';
    ctx.beginPath();
    ctx.arc(controlX - 2, dotY - 2, 2, 0, 2 * Math.PI);
    ctx.fill();
    
    // Yellow dot with inner highlight
    ctx.fillStyle = '#ffbd2e';
    ctx.beginPath();
    ctx.arc(controlX + dotSpacing, dotY, dotRadius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = '#ffd54f';
    ctx.beginPath();
    ctx.arc(controlX + dotSpacing - 2, dotY - 2, 2, 0, 2 * Math.PI);
    ctx.fill();
    
    // Green dot with inner highlight
    ctx.fillStyle = '#28ca42';
    ctx.beginPath();
    ctx.arc(controlX + dotSpacing * 2, dotY, dotRadius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = '#66bb6a';
    ctx.beginPath();
    ctx.arc(controlX + dotSpacing * 2 - 2, dotY - 2, 2, 0, 2 * Math.PI);
    ctx.fill();
    
    // Title in header with better styling
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(title, 80, 22);
    
    // Add subtitle with line count only
    ctx.fillStyle = '#a0a0a0';
    ctx.font = '11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(`${lines.length} lines`, 80, 36);
    
    // Code block background with gradient (macOS terminal style)
    const codeGradient = ctx.createLinearGradient(0, 50, 0, canvas.height);
    codeGradient.addColorStop(0, '#0d1117');
    codeGradient.addColorStop(1, '#161b22');
    ctx.fillStyle = codeGradient;
    ctx.fillRect(0, 50, canvas.width, canvas.height - 50);
    
    // Code block border with rounded corners effect
    ctx.strokeStyle = '#30363d';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 50, canvas.width, canvas.height - 50);
    
    // Add subtle inner border
    ctx.strokeStyle = '#21262d';
    ctx.lineWidth = 1;
    ctx.strokeRect(1, 51, canvas.width - 2, canvas.height - 52);
    
    // Code content with enhanced styling
    ctx.fillStyle = '#f0f6fc';
    ctx.font = '14px "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace';
    ctx.textAlign = 'left';
    
    let yPos = 80;
    const lineNumberWidth = 50;
    
    // Add line number background
    ctx.fillStyle = '#161b22';
    ctx.fillRect(0, 50, lineNumberWidth + 20, canvas.height - 50);
    
    // Add separator line
    ctx.strokeStyle = '#30363d';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(lineNumberWidth + 20, 50);
    ctx.lineTo(lineNumberWidth + 20, canvas.height);
    ctx.stroke();
    
    lines.forEach((line, index) => {
      // Line number with enhanced styling
      ctx.fillStyle = '#7d8590';
      ctx.font = '12px "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace';
      ctx.textAlign = 'right';
      ctx.fillText(String(index + 1).padStart(3, ' '), lineNumberWidth, yPos);
      
      // Code line with syntax highlighting simulation
      ctx.fillStyle = '#f0f6fc';
      ctx.font = '14px "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace';
      ctx.textAlign = 'left';
      
      // Simple syntax highlighting for common patterns
      let processedLine = line;
      if (line.trim().startsWith('//') || line.trim().startsWith('/*')) {
        ctx.fillStyle = '#7c3aed'; // Purple for comments
      } else if (line.trim().startsWith('function') || line.trim().startsWith('const') || line.trim().startsWith('let') || line.trim().startsWith('var')) {
        ctx.fillStyle = '#f59e0b'; // Orange for keywords
      } else if (line.includes('"') || line.includes("'")) {
        ctx.fillStyle = '#10b981'; // Green for strings
      } else if (line.includes('{') || line.includes('}') || line.includes('(') || line.includes(')')) {
        ctx.fillStyle = '#ef4444'; // Red for brackets
      } else {
        ctx.fillStyle = '#f0f6fc'; // Default white
      }
      
      ctx.fillText(line, lineNumberWidth + 30, yPos);
      
      yPos += lineHeight;
    });
    
    // Add footer with generation info
    const footerY = canvas.height - 20;
    ctx.fillStyle = '#7d8590';
    ctx.font = '10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`Generated on ${new Date().toLocaleDateString()} • AI Toolbox`, canvas.width - padding, footerY);
    
    // Add subtle border for definition
    ctx.strokeStyle = '#404040';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
    
    // Debug: Log canvas info
    console.log('Canvas dimensions:', canvas.width, 'x', canvas.height);
    console.log('Code lines:', lines.length);
    console.log('Title:', title);
    console.log('Language:', language);

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
