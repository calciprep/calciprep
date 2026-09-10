import { jsPDF } from 'jspdf';

export interface PassageData {
  title: string;
  text: string;
  examType?: string;
  difficulty?: string;
}

export const downloadPassageAsPDF = (passage: PassageData) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth(); 
  const pageHeight = doc.internal.pageSize.getHeight(); 
  const margin = 20;
  
  const maxTextWidth = pageWidth - (margin * 2) - 9; 

  const extractedText = passage.text.length > 2750 
    ? passage.text.substring(0, 2750) 
    : passage.text;

  const wordCount = extractedText.trim().split(/\s+/).length;
  const keystrokeCount = extractedText.length;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(30, 58, 138); 
  doc.text(`CalciPrep.online | ${passage.title}`, pageWidth / 2, 20, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(120, 120, 120); 
  doc.text(`Duration: 10 min | Words: ${wordCount} | Keystrokes (incl. spaces): ${keystrokeCount}`, pageWidth / 2, 27, { align: 'center' });

  doc.setLineWidth(0.5);
  doc.line(margin, 31, pageWidth - margin, 31);
  
  doc.setFont('times', 'normal');
  doc.setFontSize(13); 
  doc.setTextColor(0, 0, 0);

  const lines = doc.splitTextToSize(extractedText, maxTextWidth); 
  
  let cursorY = 41; 
  const lineHeight = 6.5; 

  let runningKeystrokes = 0;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const printLine = rawLine.trim();

    if (i === lines.length - 1) {
      runningKeystrokes = keystrokeCount;
    } else {
      runningKeystrokes += rawLine.length + 1; 
    }

    if (cursorY + lineHeight > pageHeight - 12) {
      doc.addPage();
      cursorY = 20;
    }

    doc.setFont('times', 'normal');
    doc.setFontSize(13);
    doc.setTextColor(0, 0, 0);

    const textWidth = doc.getTextWidth(printLine);
    const isEndOfParagraph = (textWidth < maxTextWidth * 0.85) || i === lines.length - 1;

    if (isEndOfParagraph) {
      doc.text(printLine, margin, cursorY);
    } else {
      doc.text(printLine, margin, cursorY, { align: 'justify', maxWidth: maxTextWidth });
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text(runningKeystrokes.toString(), pageWidth - margin, cursorY, { align: 'right' });

    cursorY += lineHeight;
  }

  const totalPages = (doc.internal as any).getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Downloaded from calciprep.online`, 
      pageWidth / 2, 
      pageHeight - 8, 
      { align: 'center' }
    );
  }

  doc.save(`${passage.title.replace(/\s+/g, '_')}_CalciPrep.pdf`); 
};

export const downloadBulkPassagesAsPDF = (passages: PassageData[], examName: string) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  
  const maxTextWidth = pageWidth - (margin * 2) - 9;

  const groups = {
    Easy: passages.filter(p => (p.difficulty || 'Easy').toLowerCase() === 'easy'),
    Moderate: passages.filter(p => ['moderate', 'medium'].includes((p.difficulty || '').toLowerCase())),
    Hard: passages.filter(p => (p.difficulty || '').toLowerCase() === 'hard')
  };

  let isFirstPage = true;

  const printPassages = (groupName: string, groupPassages: PassageData[]) => {
    if (groupPassages.length === 0) return;

    groupPassages.forEach((passage) => {
      if (!isFirstPage) doc.addPage();
      isFirstPage = false;

      const extractedText = passage.text.length > 2750 
        ? passage.text.substring(0, 2750) 
        : passage.text;

      const wordCount = extractedText.trim().split(/\s+/).length;
      const keystrokeCount = extractedText.length;

      // --- FIXED: Now uses the exact passage title from the database! ---
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(30, 58, 138);
      doc.text(`CalciPrep.online | ${passage.title}`, pageWidth / 2, 20, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(120, 120, 120); 
      doc.text(`Duration: 10 min | Words: ${wordCount} | Keystrokes (incl. spaces): ${keystrokeCount}`, pageWidth / 2, 27, { align: 'center' });

      doc.setLineWidth(0.5);
      doc.line(margin, 31, pageWidth - margin, 31);

      doc.setFont('times', 'normal');
      doc.setFontSize(13);
      doc.setTextColor(0, 0, 0);

      const lines = doc.splitTextToSize(extractedText, maxTextWidth);
      
      let cursorY = 41;
      const lineHeight = 6.5; 
      let runningKeystrokes = 0;

      for (let i = 0; i < lines.length; i++) {
        const rawLine = lines[i];
        const printLine = rawLine.trim();

        if (i === lines.length - 1) {
          runningKeystrokes = keystrokeCount;
        } else {
          runningKeystrokes += rawLine.length + 1; 
        }

        if (cursorY + lineHeight > pageHeight - 12) {
          doc.addPage();
          cursorY = 20;
        }

        doc.setFont('times', 'normal');
        doc.setFontSize(13);
        doc.setTextColor(0, 0, 0);

        const textWidth = doc.getTextWidth(printLine);
        const isEndOfParagraph = (textWidth < maxTextWidth * 0.85) || i === lines.length - 1;

        if (isEndOfParagraph) {
          doc.text(printLine, margin, cursorY);
        } else {
          doc.text(printLine, margin, cursorY, { align: 'justify', maxWidth: maxTextWidth });
        }

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(150, 150, 150);
        doc.text(runningKeystrokes.toString(), pageWidth - margin, cursorY, { align: 'right' });

        cursorY += lineHeight;
      }
    });
  };

  printPassages('Easy', groups.Easy);
  printPassages('Moderate', groups.Moderate);
  printPassages('Hard', groups.Hard);

  const totalPages = (doc.internal as any).getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Downloaded from calciprep.online`,
      pageWidth / 2,
      pageHeight - 8,
      { align: 'center' }
    );
  }

  doc.save(`${examName.replace(/\s+/g, '_')}_Bulk_Collection.pdf`);
};