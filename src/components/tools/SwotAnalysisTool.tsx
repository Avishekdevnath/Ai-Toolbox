'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  X, 
  AlertCircle, 
  CheckCircle,
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react';

type SwotType = 'personal' | 'business' | 'project' | 'career' | 'investment' | 'emotional' | '';

export default function SwotAnalysisTool() {
  const [step, setStep] = useState(1);
  const [swotType, setSwotType] = useState<SwotType>('');
  const [formData, setFormData] = useState({
    name: '',
    // Personal fields
    age: '',
    profession: '',
    goals: '',
    challenges: '',
    skills: '',
    // Business fields
    businessType: '',
    industry: '',
    companySize: '',
    yearsInBusiness: '',
    businessDescription: '',
    // Project fields
    projectName: '',
    projectType: '',
    duration: '',
    budget: '',
    projectDescription: '',
    // Career fields
    currentRole: '',
    targetRole: '',
    experience: '',
    careerGoals: '',
    // Investment fields
    investmentType: '',
    amount: '',
    timeHorizon: '',
    riskTolerance: '',
    // Emotional fields
    emotionalGoals: '',
    stressFactors: '',
    emotionalStrengths: '',
    relationshipStatus: '',
    copingMechanisms: '',
  });
  const [swotAnalysis, setSwotAnalysis] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const swotTypes = [
    {
      id: 'personal',
      title: 'Personal SWOT',
      description: 'Analyze your personal strengths, weaknesses, opportunities, and threats',
      icon: '👤',
      color: 'blue'
    },
    {
      id: 'business',
      title: 'Business SWOT',
      description: 'Strategic analysis for companies, startups, or business ideas',
      icon: '🏢',
      color: 'green'
    },
    {
      id: 'project',
      title: 'Project SWOT',
      description: 'Analyze specific projects, initiatives, or ventures',
      icon: '📋',
      color: 'purple'
    },
    {
      id: 'career',
      title: 'Career SWOT',
      description: 'Career development and professional growth analysis',
      icon: '🎯',
      color: 'orange'
    },
    {
      id: 'investment',
      title: 'Investment SWOT',
      description: 'Analyze investment opportunities and financial decisions',
      icon: '💰',
      color: 'yellow'
    },
    {
      id: 'emotional',
      title: 'Emotional SWOT',
      description: 'Analyze emotional patterns, triggers, and growth opportunities',
      icon: '🧠',
      color: 'pink'
    }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTypeSelect = (type: SwotType) => {
    setSwotType(type);
    setStep(2);
  };

  const validateForm = () => {
    if (!formData.name.trim()) return false;
    
    switch (swotType) {
      case 'personal':
        return formData.profession.trim() && formData.goals.trim();
      case 'business':
        return formData.businessType.trim() && formData.businessDescription.trim();
      case 'project':
        return formData.projectName.trim() && formData.projectDescription.trim();
      case 'career':
        return formData.currentRole.trim() && formData.careerGoals.trim();
      case 'investment':
        return formData.investmentType.trim() && formData.amount.trim();
      case 'emotional':
        return formData.emotionalGoals.trim() && formData.stressFactors.trim();
      default:
        return false;
    }
  };

  const generateAnalysis = async () => {
    setIsGenerating(true);

    try {
      const response = await fetch('/api/analyze/swot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          swotType,
          formData,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSwotAnalysis(data.result);
        setStep(3);
        // Track tool usage for analytics
        fetch('/api/tools/swot-analysis/track-usage', { 
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ usageType: 'generate' })
        });
      } else {
        throw new Error(data.error || 'Failed to generate analysis');
      }
    } catch (error) {
      console.error('Analysis generation error:', error);
      alert('AI analysis failed: ' + (error as Error).message + '\n\nPlease check your API key and try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const resetWizard = () => {
    setStep(1);
    setSwotType('');
    setFormData({
      name: '',
      age: '', profession: '', goals: '', challenges: '', skills: '',
      businessType: '', industry: '', companySize: '', yearsInBusiness: '', businessDescription: '',
      projectName: '', projectType: '', duration: '', budget: '', projectDescription: '',
      currentRole: '', targetRole: '', experience: '', careerGoals: '',
      investmentType: '', amount: '', timeHorizon: '', riskTolerance: '',
      emotionalGoals: '', stressFactors: '', emotionalStrengths: '', relationshipStatus: '', copingMechanisms: '',
    });
    setSwotAnalysis(null);
  };

  const exportAnalysis = () => {
    if (!swotAnalysis) {
      alert('Please generate a SWOT analysis first before exporting.');
      return;
    }
    
    const getTypeContext = () => {
      switch (swotType) {
        case 'personal':
          return `Name: ${formData.name}\nProfession: ${formData.profession}\nGoals: ${formData.goals}`;
        case 'business':
          return `Business: ${formData.businessType}\nIndustry: ${formData.industry}\nDescription: ${formData.businessDescription}`;
        case 'project':
          return `Project: ${formData.projectName}\nType: ${formData.projectType}\nDescription: ${formData.projectDescription}`;
        case 'career':
          return `Name: ${formData.name}\nCurrent Role: ${formData.currentRole}\nTarget Role: ${formData.targetRole}`;
        case 'investment':
          return `Investment: ${formData.investmentType}\nAmount: ${formData.amount}\nTime Horizon: ${formData.timeHorizon}`;
        case 'emotional':
          return `Name: ${formData.name}\nEmotional Goals: ${formData.emotionalGoals}\nStress Factors: ${formData.stressFactors}`;
        default:
          return '';
      }
    };

    const content = `
PERSONALIZED SWOT ANALYSIS
Type: ${swotType.toUpperCase()}
${getTypeContext()}

STRENGTHS:
${swotAnalysis.strengths.map((item: string) => `• ${item}`).join('\n')}

WEAKNESSES:
${swotAnalysis.weaknesses.map((item: string) => `• ${item}`).join('\n')}

OPPORTUNITIES:
${swotAnalysis.opportunities.map((item: string) => `• ${item}`).join('\n')}

THREATS:
${swotAnalysis.threats.map((item: string) => `• ${item}`).join('\n')}

AI-POWERED STRATEGIC RECOMMENDATIONS:

🚀 LEVERAGE YOUR STRENGTHS:
${swotAnalysis.aiTips?.leverageStrengths?.map((tip: string) => `• ${tip}`).join('\n') || 'No tips available'}

🔧 ADDRESS WEAKNESSES:
${swotAnalysis.aiTips?.addressWeaknesses?.map((strategy: string) => `• ${strategy}`).join('\n') || 'No strategies available'}

💡 CAPITALIZE ON OPPORTUNITIES:
${swotAnalysis.aiTips?.capitalizeOpportunities?.map((way: string) => `• ${way}`).join('\n') || 'No recommendations available'}

🛡️ MITIGATE THREATS:
${swotAnalysis.aiTips?.mitigateThreats?.map((method: string) => `• ${method}`).join('\n') || 'No methods available'}

📈 STRATEGIC RECOMMENDATIONS:
${swotAnalysis.aiTips?.strategicRecommendations?.map((rec: string) => `• ${rec}`).join('\n') || 'No recommendations available'}

💪 MOTIVATIONAL SUMMARY:
${swotAnalysis.aiTips?.motivationalSummary || 'Keep pushing forward!'}

Generated on: ${new Date().toLocaleDateString()}
Generated by AI Toolbox
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${swotType}-swot-analysis-${formData.name.replace(/\s+/g, '-').toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateSocialCard = async () => {
    if (!swotAnalysis) {
      alert('Please generate a SWOT analysis first before creating a social card.');
      return;
    }
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set larger canvas size for detailed content (2:3 ratio for better mobile viewing)
    canvas.width = 1080;
    canvas.height = 1620;
    
    if (!ctx) return;
    
    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Helper function to wrap text
    const wrapText = (text: string, maxWidth: number, fontSize: number) => {
      ctx.font = `${fontSize}px Arial`;
      const words = text.split(' ');
      const lines = [];
      let currentLine = words[0];
      
      for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = ctx.measureText(currentLine + ' ' + word).width;
        if (width < maxWidth) {
          currentLine += ' ' + word;
        } else {
          lines.push(currentLine);
          currentLine = word;
        }
      }
      lines.push(currentLine);
      return lines;
    };

    let yPos = 60;
    
    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 42px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🎯 DETAILED SWOT ANALYSIS', canvas.width / 2, yPos);
    yPos += 50;
    
    // Name/Subject
    ctx.font = 'bold 32px Arial';
    ctx.fillText(formData.name.toUpperCase(), canvas.width / 2, yPos);
    yPos += 40;
    
    // Type
    const selectedType = swotTypes.find(type => type.id === swotType);
    ctx.font = '24px Arial';
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText(`${selectedType?.icon} ${selectedType?.title}`, canvas.width / 2, yPos);
    yPos += 60;
    
    // SWOT Sections - Full detailed view
    const boxWidth = 1000;
    const boxHeight = 200;
    const gap = 20;
    const margin = 40;
    
    const swotSections = [
      { title: '💪 STRENGTHS', items: swotAnalysis.strengths, color: '#10b981' },
      { title: '⚠️ WEAKNESSES', items: swotAnalysis.weaknesses, color: '#ef4444' },
      { title: '🚀 OPPORTUNITIES', items: swotAnalysis.opportunities, color: '#3b82f6' },
      { title: '⚡ THREATS', items: swotAnalysis.threats, color: '#f59e0b' }
    ];
    
    swotSections.forEach(section => {
      // Box background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.fillRect(margin, yPos, boxWidth, boxHeight);
      
      // Title
      ctx.fillStyle = section.color;
      ctx.font = 'bold 22px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(section.title, margin + 20, yPos + 35);
      
      // Items - Show ALL items with text wrapping
      ctx.fillStyle = '#1f2937';
      ctx.font = '16px Arial';
      let itemY = yPos + 60;
      
      section.items.forEach((item: string, index: number) => {
        if (itemY > yPos + boxHeight - 30) return; // Don't overflow box
        
        const lines = wrapText(`• ${item}`, boxWidth - 60, 16);
        lines.forEach((line, lineIndex) => {
          if (itemY <= yPos + boxHeight - 20) {
            ctx.fillText(line, margin + 20, itemY);
            itemY += 20;
          }
        });
        itemY += 5; // Small gap between items
      });
      
      yPos += boxHeight + gap;
    });
    
    // AI Tips section - Detailed
    const aiTipsHeight = 400;
    ctx.fillStyle = 'rgba(139, 92, 246, 0.95)';
    ctx.fillRect(margin, yPos, boxWidth, aiTipsHeight);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🤖 AI STRATEGIC RECOMMENDATIONS', canvas.width / 2, yPos + 35);
    
    // Key recommendations
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'left';
    let tipY = yPos + 70;
    
    const tipSections = [
      { title: '🚀 Leverage Strengths:', tips: swotAnalysis.aiTips?.leverageStrengths || [] },
      { title: '🔧 Address Weaknesses:', tips: swotAnalysis.aiTips?.addressWeaknesses || [] },
      { title: '💡 Capitalize Opportunities:', tips: swotAnalysis.aiTips?.capitalizeOpportunities || [] },
      { title: '📈 Strategic Actions:', tips: swotAnalysis.aiTips?.strategicRecommendations || [] }
    ];
    
    tipSections.forEach(tipSection => {
      if (tipY > yPos + aiTipsHeight - 40) return;
      
      ctx.fillStyle = '#fbbf24';
      ctx.fillText(tipSection.title, margin + 20, tipY);
      tipY += 25;
      
      ctx.fillStyle = '#ffffff';
      ctx.font = '14px Arial';
      
      tipSection.tips.slice(0, 2).forEach((tip: string) => {
        if (tipY > yPos + aiTipsHeight - 20) return;
        
        const lines = wrapText(`• ${tip}`, boxWidth - 60, 14);
        lines.slice(0, 2).forEach((line, index) => { // Max 2 lines per tip
          if (tipY <= yPos + aiTipsHeight - 20) {
            ctx.fillText(line, margin + 30, tipY);
            tipY += 16;
          }
        });
        tipY += 5;
      });
      tipY += 10;
    });
    
    yPos += aiTipsHeight + 20;
    
    // Motivational summary
    if (swotAnalysis.aiTips?.motivationalSummary) {
      ctx.fillStyle = 'rgba(6, 182, 212, 0.9)';
      ctx.fillRect(margin, yPos, boxWidth, 80);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('💪 MOTIVATION', canvas.width / 2, yPos + 30);
      
      ctx.font = '16px Arial';
      const motivationLines = wrapText(swotAnalysis.aiTips.motivationalSummary, boxWidth - 60, 16);
      motivationLines.slice(0, 2).forEach((line, index) => {
        ctx.fillText(line, canvas.width / 2, yPos + 55 + (index * 18));
      });
      
      yPos += 100;
    }
    
    // Footer
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`Generated on ${new Date().toLocaleDateString()}`, canvas.width / 2, yPos + 20);
    ctx.fillText('Powered by AI Toolbox | Share your success! #SWOTAnalysis', canvas.width / 2, yPos + 40);
    
    // Download
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `detailed-${swotType}-analysis-${formData.name.replace(/\s+/g, '-').toLowerCase()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    });
  };

  const generateDetailedPDF = () => {
    if (!swotAnalysis) {
      alert('Please generate a SWOT analysis first before creating a PDF report.');
      return;
    }
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const selectedType = swotTypes.find(type => type.id === swotType);
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Detailed SWOT Analysis Report - ${formData.name}</title>
        <style>
          @page { 
            size: A4; 
            margin: 20mm; 
          }
          body { 
            font-family: 'Arial', sans-serif; 
            line-height: 1.6; 
            color: #333; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 20px;
          }
          .container {
            background: white;
            border-radius: 15px;
            padding: 40px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          }
          .header { 
            text-align: center; 
            margin-bottom: 40px; 
            border-bottom: 3px solid #667eea;
            padding-bottom: 20px;
          }
          .header h1 { 
            color: #667eea; 
            font-size: 2.5em; 
            margin: 0; 
            font-weight: bold;
          }
          .header h2 { 
            color: #764ba2; 
            font-size: 1.5em; 
            margin: 10px 0; 
          }
          .header p { 
            color: #666; 
            font-size: 1.1em; 
          }
          .swot-grid { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 20px; 
            margin: 30px 0; 
          }
          .swot-section { 
            border-radius: 10px; 
            padding: 20px; 
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
          }
          .strengths { background: linear-gradient(135deg, #10b981, #34d399); color: white; }
          .weaknesses { background: linear-gradient(135deg, #ef4444, #f87171); color: white; }
          .opportunities { background: linear-gradient(135deg, #3b82f6, #60a5fa); color: white; }
          .threats { background: linear-gradient(135deg, #f59e0b, #fbbf24); color: white; }
          .swot-section h3 { 
            margin: 0 0 15px 0; 
            font-size: 1.4em; 
            font-weight: bold;
          }
          .swot-section ul { 
            margin: 0; 
            padding-left: 20px; 
          }
          .swot-section li { 
            margin-bottom: 8px; 
            font-size: 0.95em;
          }
                     .ai-tips {
             background: linear-gradient(135deg, #7c3aed, #a855f7);
             color: white;
             border-radius: 15px;
             padding: 30px;
             margin: 30px 0;
           }
           .ai-tips h3 {
             text-align: center;
             font-size: 1.8em;
             margin-bottom: 30px;
           }
           .tips-grid {
             display: grid;
             grid-template-columns: 1fr;
             gap: 25px;
           }
           .tip-section {
             background: rgba(255,255,255,0.1);
             border-radius: 8px;
             padding: 20px;
             border-left: 4px solid #fbbf24;
           }
           .tip-section h4 {
             margin: 0 0 15px 0;
             font-size: 1.2em;
             color: #fbbf24;
           }
           .tip-section ul {
             margin: 0;
             padding-left: 20px;
           }
           .tip-section li {
             margin-bottom: 8px;
             font-size: 0.95em;
             line-height: 1.4;
           }
           .detailed-tips {
             background: rgba(255,255,255,0.05);
             border-radius: 10px;
             padding: 20px;
             margin-top: 20px;
           }
           .detailed-tips h4 {
             color: #34d399;
             font-size: 1.1em;
             margin-bottom: 15px;
           }
          .motivation {
            background: linear-gradient(135deg, #06b6d4, #0891b2);
            color: white;
            border-radius: 10px;
            padding: 20px;
            text-align: center;
            margin: 20px 0;
            font-size: 1.1em;
            font-style: italic;
          }
          .footer { 
            text-align: center; 
            color: #666; 
            font-size: 0.9em; 
            margin-top: 40px; 
            border-top: 2px solid #eee;
            padding-top: 20px;
          }
          @media print {
            body { background: white !important; }
            .container { box-shadow: none; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎯 SWOT ANALYSIS</h1>
            <h2>${formData.name}</h2>
            <p>${selectedType?.icon} ${selectedType?.title}</p>
          </div>
          
          <div class="swot-grid">
            <div class="swot-section strengths">
              <h3>💪 Strengths</h3>
              <ul>
                ${swotAnalysis.strengths.map((item: string) => `<li>${item}</li>`).join('')}
              </ul>
            </div>
            
            <div class="swot-section weaknesses">
              <h3>⚠️ Weaknesses</h3>
              <ul>
                ${swotAnalysis.weaknesses.map((item: string) => `<li>${item}</li>`).join('')}
              </ul>
            </div>
            
            <div class="swot-section opportunities">
              <h3>🚀 Opportunities</h3>
              <ul>
                ${swotAnalysis.opportunities.map((item: string) => `<li>${item}</li>`).join('')}
              </ul>
            </div>
            
            <div class="swot-section threats">
              <h3>⚡ Threats</h3>
              <ul>
                ${swotAnalysis.threats.map((item: string) => `<li>${item}</li>`).join('')}
              </ul>
            </div>
          </div>
          
                     <div class="ai-tips">
             <h3>🤖 COMPREHENSIVE AI STRATEGIC RECOMMENDATIONS</h3>
             <div class="tips-grid">
               <div class="tip-section">
                 <h4>🚀 How to Leverage Your Strengths</h4>
                 <ul>
                   ${swotAnalysis.aiTips?.leverageStrengths?.map((tip: string) => `<li>${tip}</li>`).join('') || '<li>No tips available</li>'}
                 </ul>
               </div>
               
               <div class="tip-section">
                 <h4>🔧 Strategic Steps to Address Weaknesses</h4>
                 <ul>
                   ${swotAnalysis.aiTips?.addressWeaknesses?.map((strategy: string) => `<li>${strategy}</li>`).join('') || '<li>No strategies available</li>'}
                 </ul>
               </div>
               
               <div class="tip-section">
                 <h4>💡 Action Plan to Capitalize on Opportunities</h4>
                 <ul>
                   ${swotAnalysis.aiTips?.capitalizeOpportunities?.map((way: string) => `<li>${way}</li>`).join('') || '<li>No recommendations available</li>'}
                 </ul>
               </div>
               
               <div class="tip-section">
                 <h4>🛡️ Risk Mitigation & Threat Prevention</h4>
                 <ul>
                   ${swotAnalysis.aiTips?.mitigateThreats?.map((method: string) => `<li>${method}</li>`).join('') || '<li>No methods available</li>'}
                 </ul>
               </div>
             </div>
             
             <div class="detailed-tips">
               <h4>📈 Priority Action Items & Implementation Timeline</h4>
               <ul>
                 ${swotAnalysis.aiTips?.strategicRecommendations?.map((rec: string) => `<li>${rec}</li>`).join('') || '<li>No recommendations available</li>'}
               </ul>
             </div>
             
             <div class="motivation">
               💪 ${swotAnalysis.aiTips?.motivationalSummary || 'Keep pushing forward toward your goals!'}
             </div>
           </div>
           
           <div style="background: linear-gradient(135deg, #059669, #10b981); color: white; border-radius: 15px; padding: 25px; margin: 25px 0;">
             <h3 style="text-align: center; margin-bottom: 20px;">📋 SWOT Analysis Summary & Key Insights</h3>
             <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
               <div>
                 <h4 style="color: #fbbf24; margin-bottom: 10px;">🎯 Top 3 Strengths to Focus On:</h4>
                 <ol style="padding-left: 20px;">
                   ${swotAnalysis.strengths.slice(0, 3).map((strength: string) => `<li style="margin-bottom: 5px;">${strength}</li>`).join('')}
                 </ol>
               </div>
               <div>
                 <h4 style="color: #fbbf24; margin-bottom: 10px;">⚡ Top 3 Opportunities to Pursue:</h4>
                 <ol style="padding-left: 20px;">
                   ${swotAnalysis.opportunities.slice(0, 3).map((opportunity: string) => `<li style="margin-bottom: 5px;">${opportunity}</li>`).join('')}
                 </ol>
               </div>
             </div>
             <div style="margin-top: 20px; text-align: center; font-style: italic; background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px;">
               "Success comes from knowing your strengths, addressing your weaknesses, seizing opportunities, and preparing for threats. This analysis is your roadmap to strategic excellence."
             </div>
           </div>
          
                     <div class="footer">
             <p><strong>📊 Comprehensive SWOT Analysis Report</strong></p>
             <p>Generated on ${new Date().toLocaleDateString()} | Powered by AI Toolbox Advanced Analytics</p>
             <p><strong>Ready to share?</strong> #DetailedSWOTAnalysis #StrategicPlanning #AIToolbox #BusinessStrategy</p>
             <p style="font-size: 0.8em; color: #999;">This detailed analysis includes ${swotAnalysis.strengths.length + swotAnalysis.weaknesses.length + swotAnalysis.opportunities.length + swotAnalysis.threats.length} strategic insights and ${(swotAnalysis.aiTips?.leverageStrengths?.length || 0) + (swotAnalysis.aiTips?.addressWeaknesses?.length || 0) + (swotAnalysis.aiTips?.capitalizeOpportunities?.length || 0) + (swotAnalysis.aiTips?.mitigateThreats?.length || 0) + (swotAnalysis.aiTips?.strategicRecommendations?.length || 0)} AI-powered recommendations</p>
           </div>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load, then print
    setTimeout(() => {
      printWindow.print();
    }, 1000);
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center space-x-4">
        {[1, 2, 3].map((stepNum) => (
          <div key={stepNum} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              stepNum === step 
                ? 'bg-blue-600 text-white' 
                : stepNum < step 
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-300 text-gray-600'
            }`}>
              {stepNum < step ? '✓' : stepNum}
            </div>
            {stepNum < 3 && (
              <div className={`w-12 h-1 mx-2 ${
                stepNum < step ? 'bg-green-600' : 'bg-gray-300'
              }`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        What type of SWOT analysis would you like?
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Choose the analysis type that best fits your needs
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
        {swotTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => handleTypeSelect(type.id as SwotType)}
            className={`p-6 rounded-lg border-2 transition-all hover:shadow-lg hover:scale-105 ${
              type.color === 'blue' ? 'border-blue-200 hover:border-blue-400 hover:bg-blue-50' :
              type.color === 'green' ? 'border-green-200 hover:border-green-400 hover:bg-green-50' :
              type.color === 'purple' ? 'border-purple-200 hover:border-purple-400 hover:bg-purple-50' :
              type.color === 'orange' ? 'border-orange-200 hover:border-orange-400 hover:bg-orange-50' :
              'border-yellow-200 hover:border-yellow-400 hover:bg-yellow-50'
            } dark:border-gray-600 dark:hover:bg-gray-700`}
          >
            <div className="text-4xl mb-3">{type.icon}</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {type.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {type.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );

  const renderPersonalForm = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Your Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Enter your full name"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Age (Optional)
          </label>
          <input
            type="number"
            value={formData.age}
            onChange={(e) => handleInputChange('age', e.target.value)}
            placeholder="Your age"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Current Profession/Role *
        </label>
        <input
          type="text"
          value={formData.profession}
          onChange={(e) => handleInputChange('profession', e.target.value)}
          placeholder="e.g., Software Developer, Marketing Manager, Student"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Your Goals & Aspirations *
        </label>
        <textarea
          value={formData.goals}
          onChange={(e) => handleInputChange('goals', e.target.value)}
          placeholder="What are your personal or professional goals? What do you want to achieve?"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Key Skills & Talents
        </label>
        <textarea
          value={formData.skills}
          onChange={(e) => handleInputChange('skills', e.target.value)}
          placeholder="What are your strongest skills, talents, or areas of expertise?"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Current Challenges
        </label>
        <textarea
          value={formData.challenges}
          onChange={(e) => handleInputChange('challenges', e.target.value)}
          placeholder="What challenges or obstacles are you currently facing?"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
        />
      </div>
    </div>
  );

  const renderBusinessForm = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Business/Company Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Enter business name"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Business Type *
          </label>
          <input
            type="text"
            value={formData.businessType}
            onChange={(e) => handleInputChange('businessType', e.target.value)}
            placeholder="e.g., Tech Startup, Restaurant, E-commerce"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Industry
          </label>
          <input
            type="text"
            value={formData.industry}
            onChange={(e) => handleInputChange('industry', e.target.value)}
            placeholder="e.g., Technology, Healthcare, Retail"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Company Size
          </label>
          <select
            value={formData.companySize}
            onChange={(e) => handleInputChange('companySize', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">Select size</option>
            <option value="1-10">1-10 employees</option>
            <option value="11-50">11-50 employees</option>
            <option value="51-200">51-200 employees</option>
            <option value="201-1000">201-1000 employees</option>
            <option value="1000+">1000+ employees</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Years in Business
        </label>
        <input
          type="text"
          value={formData.yearsInBusiness}
          onChange={(e) => handleInputChange('yearsInBusiness', e.target.value)}
          placeholder="e.g., 2 years, 6 months, Just starting"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Business Description *
        </label>
        <textarea
          value={formData.businessDescription}
          onChange={(e) => handleInputChange('businessDescription', e.target.value)}
          placeholder="Describe your business: products/services, target market, current situation, goals, challenges, etc."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
        />
      </div>
    </div>
  );

  const renderProjectForm = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Project Name *
          </label>
          <input
            type="text"
            value={formData.projectName}
            onChange={(e) => handleInputChange('projectName', e.target.value)}
            placeholder="Enter project name"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Project Type
          </label>
          <input
            type="text"
            value={formData.projectType}
            onChange={(e) => handleInputChange('projectType', e.target.value)}
            placeholder="e.g., Mobile App, Website, Marketing Campaign"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Duration
          </label>
          <input
            type="text"
            value={formData.duration}
            onChange={(e) => handleInputChange('duration', e.target.value)}
            placeholder="e.g., 3 months, 1 year"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Budget
          </label>
          <input
            type="text"
            value={formData.budget}
            onChange={(e) => handleInputChange('budget', e.target.value)}
            placeholder="e.g., $10,000, Limited budget"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Project Owner/Your Role
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder="Your name or role in this project"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Project Description *
        </label>
        <textarea
          value={formData.projectDescription}
          onChange={(e) => handleInputChange('projectDescription', e.target.value)}
          placeholder="Describe the project: objectives, scope, target audience, current status, challenges, resources available, etc."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
        />
      </div>
    </div>
  );

  const renderCareerForm = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Your Name *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder="Enter your full name"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Current Role *
          </label>
          <input
            type="text"
            value={formData.currentRole}
            onChange={(e) => handleInputChange('currentRole', e.target.value)}
            placeholder="e.g., Junior Developer, Marketing Analyst"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Target Role
          </label>
          <input
            type="text"
            value={formData.targetRole}
            onChange={(e) => handleInputChange('targetRole', e.target.value)}
            placeholder="e.g., Senior Developer, Marketing Manager"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Years of Experience
        </label>
        <input
          type="text"
          value={formData.experience}
          onChange={(e) => handleInputChange('experience', e.target.value)}
          placeholder="e.g., 2 years, Recent graduate, 10+ years"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Career Goals & Aspirations *
        </label>
        <textarea
          value={formData.careerGoals}
          onChange={(e) => handleInputChange('careerGoals', e.target.value)}
          placeholder="What are your career goals? Where do you want to be in the next 2-5 years? What skills do you want to develop?"
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white"
        />
      </div>
    </div>
  );

  const renderInvestmentForm = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Your Name *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder="Enter your full name"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Investment Type *
          </label>
          <input
            type="text"
            value={formData.investmentType}
            onChange={(e) => handleInputChange('investmentType', e.target.value)}
            placeholder="e.g., Real Estate, Stocks, Cryptocurrency, Business"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Investment Amount *
          </label>
          <input
            type="text"
            value={formData.amount}
            onChange={(e) => handleInputChange('amount', e.target.value)}
            placeholder="e.g., $10,000, $50,000"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Time Horizon
          </label>
          <select
            value={formData.timeHorizon}
            onChange={(e) => handleInputChange('timeHorizon', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">Select time frame</option>
            <option value="Short-term (< 1 year)">Short-term (&lt; 1 year)</option>
            <option value="Medium-term (1-5 years)">Medium-term (1-5 years)</option>
            <option value="Long-term (5+ years)">Long-term (5+ years)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Risk Tolerance
          </label>
          <select
            value={formData.riskTolerance}
            onChange={(e) => handleInputChange('riskTolerance', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">Select risk level</option>
            <option value="Conservative">Conservative (Low risk)</option>
            <option value="Moderate">Moderate (Medium risk)</option>
            <option value="Aggressive">Aggressive (High risk)</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderEmotionalForm = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Your Name *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder="Enter your full name"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 dark:bg-gray-700 dark:text-white"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Emotional Goals & Development *
        </label>
        <textarea
          value={formData.emotionalGoals}
          onChange={(e) => handleInputChange('emotionalGoals', e.target.value)}
          placeholder="What are your emotional goals? What aspects of emotional well-being do you want to improve? (e.g., better stress management, improved relationships, increased confidence)"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 dark:bg-gray-700 dark:text-white"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Stress Factors & Triggers *
        </label>
        <textarea
          value={formData.stressFactors}
          onChange={(e) => handleInputChange('stressFactors', e.target.value)}
          placeholder="What situations, people, or circumstances typically cause you stress or emotional difficulty? Include work, personal, or social triggers."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 dark:bg-gray-700 dark:text-white"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Emotional Strengths & Positive Traits
        </label>
        <textarea
          value={formData.emotionalStrengths}
          onChange={(e) => handleInputChange('emotionalStrengths', e.target.value)}
          placeholder="What are your emotional strengths? (e.g., empathy, resilience, optimism, emotional awareness, ability to stay calm under pressure)"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 dark:bg-gray-700 dark:text-white"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Relationship Status & Social Support
        </label>
        <textarea
          value={formData.relationshipStatus}
          onChange={(e) => handleInputChange('relationshipStatus', e.target.value)}
          placeholder="Describe your current relationships and social support system. How do they impact your emotional well-being?"
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 dark:bg-gray-700 dark:text-white"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Current Coping Mechanisms
        </label>
        <textarea
          value={formData.copingMechanisms}
          onChange={(e) => handleInputChange('copingMechanisms', e.target.value)}
          placeholder="How do you currently manage stress and difficult emotions? What strategies work or don't work for you?"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 dark:bg-gray-700 dark:text-white"
        />
      </div>
    </div>
  );

  const renderStep2 = () => {
    const selectedType = swotTypes.find(type => type.id === swotType);
    
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">{selectedType?.icon}</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {selectedType?.title}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Fill in the details below for a personalized analysis
          </p>
        </div>

        {swotType === 'personal' && renderPersonalForm()}
        {swotType === 'business' && renderBusinessForm()}
        {swotType === 'project' && renderProjectForm()}
        {swotType === 'career' && renderCareerForm()}
        {swotType === 'investment' && renderInvestmentForm()}
        {swotType === 'emotional' && renderEmotionalForm()}

        <div className="flex space-x-3 mt-8">
          <button
            onClick={() => setStep(1)}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            ← Back
          </button>
          <button
            onClick={generateAnalysis}
            disabled={!validateForm() || isGenerating}
            className={`flex-1 py-2 px-4 rounded-md transition-colors ${
              selectedType?.color === 'blue' ? 'bg-blue-600 hover:bg-blue-700' :
              selectedType?.color === 'green' ? 'bg-green-600 hover:bg-green-700' :
              selectedType?.color === 'purple' ? 'bg-purple-600 hover:bg-purple-700' :
              selectedType?.color === 'orange' ? 'bg-orange-600 hover:bg-orange-700' :
              selectedType?.color === 'pink' ? 'bg-pink-600 hover:bg-pink-700' :
              'bg-yellow-600 hover:bg-yellow-700'
            } text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isGenerating ? 'Generating Analysis...' : 'Generate SWOT Analysis'}
          </button>
        </div>

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
            💡 Getting the Best Results:
          </h3>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <li>• Be specific and detailed in your descriptions</li>
            <li>• Include both current situation and future goals</li>
            <li>• Mention challenges you're facing</li>
            <li>• The more context you provide, the better the analysis</li>
          </ul>
        </div>
      </div>
    );
  };

  const renderStep3 = () => {
    const selectedType = swotTypes.find(type => type.id === swotType);
    
    if (!swotAnalysis) {
      return (
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-red-500 text-lg mb-4">
            ❌ No analysis data available. Please try again.
          </div>
          <button
            onClick={resetWizard}
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            Start Over
          </button>
        </div>
      );
    }
    
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">{selectedType?.icon}</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Your Personalized {selectedType?.title}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Analysis for: <strong>{formData.name}</strong>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Strengths */}
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-4 flex items-center">
              <span className="mr-2">💪</span> Strengths
            </h3>
            <ul className="space-y-2">
              {swotAnalysis?.strengths?.map((strength: string, index: number) => (
                <li key={index} className="text-sm text-green-700 dark:text-green-300 flex items-start">
                  <span className="mr-2 text-green-500 mt-1">•</span>
                  {strength}
                </li>
              ))}
            </ul>
          </div>

          {/* Weaknesses */}
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-4 flex items-center">
              <span className="mr-2">⚠️</span> Weaknesses
            </h3>
            <ul className="space-y-2">
              {swotAnalysis?.weaknesses?.map((weakness: string, index: number) => (
                <li key={index} className="text-sm text-red-700 dark:text-red-300 flex items-start">
                  <span className="mr-2 text-red-500 mt-1">•</span>
                  {weakness}
                </li>
              ))}
            </ul>
          </div>

          {/* Opportunities */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-4 flex items-center">
              <span className="mr-2">🚀</span> Opportunities
            </h3>
            <ul className="space-y-2">
              {swotAnalysis?.opportunities?.map((opportunity: string, index: number) => (
                <li key={index} className="text-sm text-blue-700 dark:text-blue-300 flex items-start">
                  <span className="mr-2 text-blue-500 mt-1">•</span>
                  {opportunity}
                </li>
              ))}
            </ul>
          </div>

          {/* Threats */}
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-200 mb-4 flex items-center">
              <span className="mr-2">⚡</span> Threats
            </h3>
            <ul className="space-y-2">
              {swotAnalysis?.threats?.map((threat: string, index: number) => (
                <li key={index} className="text-sm text-orange-700 dark:text-orange-300 flex items-start">
                  <span className="mr-2 text-orange-500 mt-1">•</span>
                  {threat}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* AI Tips Section */}
        {swotAnalysis?.aiTips && (
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl p-6 mb-8 text-white">
            <h3 className="text-xl font-bold text-center mb-6 flex items-center justify-center">
              <span className="mr-2">🤖</span> AI-POWERED STRATEGIC RECOMMENDATIONS
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-white/10 rounded-lg p-4">
                <h4 className="font-semibold mb-2 flex items-center">
                  <span className="mr-2">🚀</span> Leverage Your Strengths
                </h4>
                <ul className="text-sm space-y-1">
                  {swotAnalysis.aiTips.leverageStrengths?.map((tip: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2 text-yellow-300 mt-1">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-white/10 rounded-lg p-4">
                <h4 className="font-semibold mb-2 flex items-center">
                  <span className="mr-2">🔧</span> Address Weaknesses
                </h4>
                <ul className="text-sm space-y-1">
                  {swotAnalysis.aiTips.addressWeaknesses?.map((strategy: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2 text-yellow-300 mt-1">•</span>
                      {strategy}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-white/10 rounded-lg p-4">
                <h4 className="font-semibold mb-2 flex items-center">
                  <span className="mr-2">💡</span> Capitalize Opportunities
                </h4>
                <ul className="text-sm space-y-1">
                  {swotAnalysis.aiTips.capitalizeOpportunities?.map((way: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2 text-yellow-300 mt-1">•</span>
                      {way}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-white/10 rounded-lg p-4">
                <h4 className="font-semibold mb-2 flex items-center">
                  <span className="mr-2">🛡️</span> Mitigate Threats
                </h4>
                <ul className="text-sm space-y-1">
                  {swotAnalysis.aiTips.mitigateThreats?.map((method: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2 text-yellow-300 mt-1">•</span>
                      {method}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg p-4 mb-4">
              <h4 className="font-semibold mb-2 text-center">💪 Motivational Summary</h4>
              <p className="text-center italic">{swotAnalysis.aiTips.motivationalSummary}</p>
            </div>

            <div className="bg-white/10 rounded-lg p-4">
              <h4 className="font-semibold mb-2 flex items-center">
                <span className="mr-2">📈</span> Strategic Recommendations
              </h4>
              <ul className="text-sm space-y-1">
                {swotAnalysis.aiTips.strategicRecommendations?.map((rec: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2 text-yellow-300 mt-1">•</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={exportAnalysis}
            className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            📄 Export Text
          </button>
          <button
            onClick={generateDetailedPDF}
            className="bg-gradient-to-r from-purple-600 to-purple-700 text-white py-2 px-4 rounded-md hover:from-purple-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors"
          >
            📋 Detailed PDF Report
          </button>
          <button
            onClick={generateSocialCard}
            className="bg-gradient-to-r from-pink-500 to-rose-500 text-white py-2 px-4 rounded-md hover:from-pink-600 hover:to-rose-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 transition-colors"
          >
            🎨 Full Analysis Card
          </button>
          <button
            onClick={resetWizard}
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            🔄 New Analysis
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 min-h-[600px]">
      {renderStepIndicator()}
      
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
    </div>
  );
} 