import jsPDF from 'jspdf';
import { Child, VaccinationRecord } from '@/types';
import { format } from 'date-fns';
import QRCode from 'qrcode';

export const generatePatientReport = async (
  child: Child,
  vaccinationRecords: VaccinationRecord[] = []
): Promise<void> => {
  try {
    console.log('Starting PDF generation for child:', child.name);
    console.log('Vaccination records count:', vaccinationRecords.length);
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    let yPosition = 20;

    // Add logo
    try {
      const logoImg = new Image();
      logoImg.crossOrigin = 'anonymous';
      await new Promise((resolve, reject) => {
        logoImg.onload = resolve;
        logoImg.onerror = reject;
        logoImg.src = '/kidcare.png';
      });
      
      // Add logo to top left
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = logoImg.width;
      canvas.height = logoImg.height;
      ctx?.drawImage(logoImg, 0, 0);
      const logoDataUrl = canvas.toDataURL('image/png');
      
      pdf.addImage(logoDataUrl, 'PNG', 15, 10, 20, 20);
    } catch (logoError) {
      console.warn('Could not load logo:', logoError);
    }
    // Header
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('KidCare Chronicle', pageWidth / 2, 25, { align: 'center' });
    yPosition = 35;
    
    pdf.setFontSize(14);
    pdf.text('Vaccination Report', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 20;

    // Patient Information
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Patient Information', 20, yPosition);
    yPosition += 10;

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    
    const patientInfo = [
      `Name: ${child.name}`,
      `Date of Birth: ${format(child.dateOfBirth, 'MMM dd, yyyy')}`,
      `Gender: ${child.gender}`,
      `Parent/Guardian: ${child.parentName}`,
      `Contact: ${child.parentContact}`,
      `Medical Record Number: ${child.medicalRecordNumber || 'N/A'}`,
    ];

    patientInfo.forEach((info) => {
      pdf.text(info, 20, yPosition);
      yPosition += 6;
    });

    if (child.allergies && Array.isArray(child.allergies) && child.allergies.length > 0) {
      yPosition += 5;
      pdf.text(`Allergies: ${child.allergies.join(', ')}`, 20, yPosition);
      yPosition += 6;
    }

    if (child.notes) {
      yPosition += 5;
      pdf.text(`Notes: ${child.notes}`, 20, yPosition);
      yPosition += 6;
    }

    yPosition += 15;

    // Vaccination Records
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Vaccination Records', 20, yPosition);
    yPosition += 15;

    if (vaccinationRecords.length === 0) {
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text('No vaccination records found.', 20, yPosition);
      yPosition += 20;
    } else {
      // Table headers
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Vaccine', 20, yPosition);
      pdf.text('Dose', 70, yPosition);
      pdf.text('Scheduled', 100, yPosition);
      pdf.text('Administered', 140, yPosition);
      pdf.text('Status', 180, yPosition);
      yPosition += 8;

      // Underline
      pdf.line(20, yPosition - 2, 200, yPosition - 2);
      yPosition += 5;

      pdf.setFont('helvetica', 'normal');
      vaccinationRecords.forEach((record) => {
        if (yPosition > 280) {
          pdf.addPage();
          yPosition = 20;
        }

        pdf.text(record.vaccineName.substring(0, 15), 20, yPosition);
        pdf.text(record.doseNumber.toString(), 70, yPosition);
        pdf.text(
          format(record.scheduledDate, 'MM/dd/yyyy'),
          100,
          yPosition
        );
        pdf.text(
          record.administeredDate
            ? format(record.administeredDate, 'MM/dd/yyyy')
            : 'N/A',
          140,
          yPosition
        );
        pdf.text(record.status, 180, yPosition);
        yPosition += 6;
      });
      yPosition += 20;
    }

    // Add QR Code for digital verification
    try {
      const qrData = JSON.stringify({
        childId: child.id,
        name: child.name,
        reportGenerated: new Date().toISOString(),
        type: 'vaccination_report'
      });
      
      const qrCodeDataURL = await QRCode.toDataURL(qrData, {
        width: 128,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
      
      // Position QR code on the right side
      const qrSize = 30;
      const qrX = pageWidth - qrSize - 20;
      
      if (yPosition + qrSize > 280) {
        pdf.addPage();
        yPosition = 20;
      }
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Digital Verification', qrX, yPosition);
      yPosition += 8;
      
      pdf.addImage(qrCodeDataURL, 'PNG', qrX, yPosition, qrSize, qrSize);
      
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Scan for digital verification', qrX, yPosition + qrSize + 5);
      
    } catch (qrError) {
      console.warn('Could not generate QR code for PDF:', qrError);
    }
    // Footer
    yPosition = pdf.internal.pageSize.getHeight() - 20;
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text(
      `Generated on ${format(new Date(), 'MMM dd, yyyy HH:mm')}`,
      pageWidth / 2,
      yPosition,
      { align: 'center' }
    );

    // Save the PDF
    console.log('Saving PDF...');
    pdf.save(`${child.name.replace(/\s+/g, '_')}_vaccination_report.pdf`);
    console.log('PDF saved successfully');
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF report: ' + (error as Error).message);
  }
};