import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ResumeContent } from '@/types';

export interface PDFExportOptions {
  /** 导出质量 (1-3) */
  quality?: number;
  /** 页面方向 */
  orientation?: 'portrait' | 'landscape';
  /** 页面格式 */
  format?: 'a4' | 'letter' | 'a3';
  /** 页边距 (mm) */
  margin?: number;
  /** 是否包含水印 */
  watermark?: boolean;
  /** 是否包含页码 */
  pageNumbers?: boolean;
}

/**
 * Export resume to PDF (增强版)
 */
export async function exportToPDF(
  elementId: string,
  fileName: string = 'resume.pdf',
  options: PDFExportOptions = {}
): Promise<void> {
  const {
    quality = 2,
    orientation = 'portrait',
    format = 'a4',
    margin = 0,
    watermark = false,
    pageNumbers = false,
  } = options;

  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with ID "${elementId}" not found`);
    }

    // Create canvas from HTML element
    const canvas = await html2canvas(element, {
      scale: quality,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    // 计算 PDF 尺寸
    const formatSizes: Record<string, [number, number]> = {
      a4: [210, 297],
      letter: [216, 279],
      a3: [297, 420],
    };
    const [baseWidth, baseHeight] = formatSizes[format] || formatSizes.a4;
    const imgWidth = orientation === 'portrait' ? baseWidth : baseHeight;
    const imgHeight = orientation === 'portrait' ? baseHeight : baseWidth;
    const contentWidth = imgWidth - margin * 2;
    const contentHeight = (canvas.height * contentWidth) / canvas.width;

    // Create PDF
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format,
    });

    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', margin, margin, contentWidth, contentHeight);

    // Handle multi-page content
    let heightLeft = contentHeight;
    let position = margin;
    let pageNumber = 1;

    while (heightLeft > contentHeight + margin) {
      position = margin - (pageNumber * (contentHeight + margin));
      heightLeft -= contentHeight + margin;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', margin, position, contentWidth, contentHeight);

      // 添加页码
      if (pageNumbers) {
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        pdf.text(
          `${pageNumber + 1}`,
          imgWidth / 2,
          imgHeight - 5,
          { align: 'center' }
        );
      }

      pageNumber++;
    }

    // 添加水印
    if (watermark) {
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(40);
        pdf.setTextColor(230, 230, 230);
        pdf.text('ResuForge AI', imgWidth / 2, imgHeight / 2, {
          align: 'center',
          angle: 45,
        });
      }
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

/**
 * 导出为 PNG 图片
 */
export async function exportToImage(
  elementId: string,
  fileName: string = 'resume.png'
): Promise<void> {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with ID "${elementId}" not found`);
    }

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    const link = document.createElement('a');
    link.download = fileName;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch (error) {
    console.error('Image export error:', error);
    throw new Error('导出图片失败，请稍后重试');
  }
}
