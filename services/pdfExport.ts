import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { GeneratedProgram, UserAssessment } from '../types';

// Extend jsPDF type for autoTable
declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable: { finalY: number };
  }
}

/**
 * Export the rehabilitation program as a PDF document
 */
export async function exportProgramToPDF(
  program: GeneratedProgram,
  assessment?: UserAssessment | null
): Promise<void> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPos = 20;

  // Helper function to add new page if needed
  const checkPageBreak = (neededSpace: number) => {
    if (yPos + neededSpace > doc.internal.pageSize.getHeight() - 20) {
      doc.addPage();
      yPos = 20;
    }
  };

  // Header
  doc.setFillColor(14, 165, 233); // primary-500
  doc.rect(0, 0, pageWidth, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('RehabFlow', margin, 25);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Ditt personliga rehabiliteringsprogram', margin, 35);

  yPos = 55;

  // Program Title
  doc.setTextColor(30, 41, 59); // slate-800
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(program.title, margin, yPos);
  yPos += 10;

  // Summary
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105); // slate-600
  const summaryLines = doc.splitTextToSize(program.summary, pageWidth - 2 * margin);
  doc.text(summaryLines, margin, yPos);
  yPos += summaryLines.length * 5 + 10;

  // Patient Info (if available)
  if (assessment) {
    checkPageBreak(30);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('Patientinformation', margin, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`Namn: ${assessment.name}`, margin, yPos);
    yPos += 5;
    doc.text(`\u00c5lder: ${assessment.age} \u00e5r`, margin, yPos);
    yPos += 5;
    doc.text(`Skadeomr\u00e5de: ${assessment.injuryLocation}`, margin, yPos);
    yPos += 5;
    doc.text(`Sm\u00e4rtniv\u00e5 (vila): ${assessment.painLevel}/10`, margin, yPos);
    yPos += 10;
  }

  // Condition Analysis
  checkPageBreak(40);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('Tillst\u00e5ndsanalys', margin, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  const analysisLines = doc.splitTextToSize(program.conditionAnalysis, pageWidth - 2 * margin);
  doc.text(analysisLines, margin, yPos);
  yPos += analysisLines.length * 5 + 15;

  // Patient Education
  if (program.patientEducation) {
    checkPageBreak(60);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('Om din diagnos', margin, yPos);
    yPos += 8;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(program.patientEducation.diagnosis, margin, yPos);
    yPos += 6;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    const explLines = doc.splitTextToSize(program.patientEducation.explanation, pageWidth - 2 * margin);
    doc.text(explLines, margin, yPos);
    yPos += explLines.length * 5 + 5;

    // Prognosis
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('Prognos:', margin, yPos);
    yPos += 5;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    const progLines = doc.splitTextToSize(program.patientEducation.prognosis, pageWidth - 2 * margin);
    doc.text(progLines, margin, yPos);
    yPos += progLines.length * 5 + 10;
  }

  // Phases
  for (const phase of program.phases) {
    checkPageBreak(50);

    // Phase header
    doc.setFillColor(241, 245, 249); // slate-100
    doc.rect(margin - 5, yPos - 5, pageWidth - 2 * margin + 10, 20, 'F');

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(phase.phaseName, margin, yPos + 5);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`Varaktighet: ${phase.durationWeeks}`, margin, yPos + 12);

    yPos += 25;

    // Phase description
    const descLines = doc.splitTextToSize(phase.description, pageWidth - 2 * margin);
    doc.text(descLines, margin, yPos);
    yPos += descLines.length * 5 + 5;

    // Goals
    if (phase.goals.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text('M\u00e5l:', margin, yPos);
      yPos += 5;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      phase.goals.forEach((goal) => {
        checkPageBreak(10);
        doc.text(`\u2022 ${goal}`, margin + 5, yPos);
        yPos += 5;
      });
      yPos += 5;
    }

    // Exercises table
    if (phase.dailyRoutine.length > 0) {
      const allExercises = phase.dailyRoutine.flatMap((day) => day.exercises);

      if (allExercises.length > 0) {
        checkPageBreak(40);

        const tableData = allExercises.map((ex) => [
          ex.name,
          ex.category,
          `${ex.sets} x ${ex.reps}`,
          ex.frequency,
          ex.difficulty || '-'
        ]);

        autoTable(doc, {
          startY: yPos,
          head: [['\u00d6vning', 'Kategori', 'Set x Reps', 'Frekvens', 'Sv\u00e5righet']],
          body: tableData,
          margin: { left: margin, right: margin },
          headStyles: {
            fillColor: [14, 165, 233],
            textColor: [255, 255, 255],
            fontStyle: 'bold'
          },
          bodyStyles: {
            textColor: [71, 85, 105]
          },
          alternateRowStyles: {
            fillColor: [248, 250, 252]
          },
          styles: {
            fontSize: 9,
            cellPadding: 3
          }
        });

        yPos = doc.lastAutoTable.finalY + 15;
      }
    }
  }

  // Footer on last page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(
      `Genererad av RehabFlow - ${new Date().toLocaleDateString('sv-SE')} - Sida ${i} av ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  // Download
  const fileName = `RehabFlow_${program.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}

/**
 * Export progress data as CSV
 */
export function exportProgressToCSV(
  progressHistory: Record<string, Record<string, boolean>>,
  painLogs?: Array<{ date: string; prePain?: number; postPain?: number }>
): void {
  let csv = 'Datum,\u00d6vning,Genomf\u00f6rd,Sm\u00e4rta f\u00f6re,Sm\u00e4rta efter\n';

  const dates = Object.keys(progressHistory).sort();

  for (const date of dates) {
    const exercises = progressHistory[date];
    const painLog = painLogs?.find((p) => p.date === date);

    for (const [exercise, completed] of Object.entries(exercises)) {
      csv += `${date},"${exercise}",${completed ? 'Ja' : 'Nej'},${painLog?.prePain ?? ''},${painLog?.postPain ?? ''}\n`;
    }
  }

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `RehabFlow_Progress_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
