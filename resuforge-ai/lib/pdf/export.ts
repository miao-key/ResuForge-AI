import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ResumeContent } from '@/types';

/**
 * Export resume to PDF
 * @param elementId - The ID of the HTML element to convert
 * @param fileName - The output PDF file name
 */
export async function exportToPDF(elementId: string, fileName: string = 'resume.pdf'): Promise<void> {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with ID "${elementId}" not found`);
    }

    // Create canvas from HTML element
    const canvas = await html2canvas(element, {
      scale: 2, // Higher quality
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    // Calculate PDF dimensions (A4 size: 210mm x 297mm)
    const imgWidth = 210; // mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Create PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

    // Handle multi-page content
    let heightLeft = imgHeight;
    let position = 0;
    const pageHeight = 297; // A4 height in mm

    while (heightLeft > pageHeight) {
      position -= pageHeight;
      heightLeft -= pageHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    }

    // Download PDF
    pdf.save(fileName);
  } catch (error) {
    console.error('PDF export error:', error);
    throw new Error('导出 PDF 失败，请稍后重试');
  }
}

/**
 * Generate PDF file name from resume content
 * @param content - Resume content
 * @returns Generated file name
 */
export function generatePDFFileName(content: ResumeContent): string {
  const name = content.personalInfo?.name || 'Resume';
  const date = new Date().toISOString().split('T')[0];
  return `${name}_简历_${date}.pdf`;
}

/**
 * Print resume (trigger browser print dialog)
 */
export function printResume(): void {
  window.print();
}
