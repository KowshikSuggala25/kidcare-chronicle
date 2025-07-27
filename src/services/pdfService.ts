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
    const pageHeight = pdf.internal.pageSize.getHeight();
    let yPosition = 20;
    let currentPage = 1;

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
    // Add border to the page
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.5);
    pdf.rect(10, 10, pageWidth - 20, pageHeight - 20);

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
    
    // Calculate age
    const calculateAge = (dateOfBirth: Date) => {
      const today = new Date();
      const birthDate = new Date(dateOfBirth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }

      if (age === 0) {
        const months =
          (today.getFullYear() - birthDate.getFullYear()) * 12 +
          today.getMonth() -
          birthDate.getMonth();
        return months <= 1
          ? `${Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24))} days`
          : `${months} months`;
      }

      return `${age} year${age !== 1 ? "s" : ""}`;
    };
    
    const patientInfo = [
      `Name: ${child.name}`,
      `Date of Birth: ${format(child.dateOfBirth, 'MMM dd, yyyy')}`,
      `Age: ${calculateAge(child.dateOfBirth)}`,
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
        if (yPosition > 260) {
          pdf.addPage();
          currentPage++;
          // Add border to new page
          pdf.rect(10, 10, pageWidth - 20, pageHeight - 20);
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

    // Add QR Code for digital verification in the middle
    let qrSize = 40; // Define qrSize outside try block
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
      
      // Position QR code in the middle of the page
      const qrX = (pageWidth - qrSize) / 2;
      
      if (yPosition + qrSize > 220) {
        pdf.addPage();
        currentPage++;
        // Add border to new page
        pdf.rect(10, 10, pageWidth - 20, pageHeight - 20);
        yPosition = 20;
      }
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Digital Verification', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 10;
      
      pdf.addImage(qrCodeDataURL, 'PNG', qrX, yPosition, qrSize, qrSize);
      
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Scan for digital verification', pageWidth / 2, yPosition + qrSize + 5, { align: 'center' });
      
    } catch (qrError) {
      console.warn('Could not generate QR code for PDF:', qrError);
    }

    // Add KidCare Chronicle Stamp (Circle)
    yPosition += qrSize + 20;
    if (yPosition + 50 > pageHeight - 30) {
      pdf.addPage();
      currentPage++;
      // Add border to new page
      pdf.rect(10, 10, pageWidth - 20, pageHeight - 20);
      yPosition = 30;
    }

    // Create circular stamp
    const stampX = pageWidth / 2;
    const stampY = yPosition + 25;
    const stampRadius = 20;
    
    pdf.setDrawColor(41, 98, 255); // Primary color
    pdf.setLineWidth(2);
    pdf.circle(stampX, stampY, stampRadius);
    
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(41, 98, 255);
    pdf.text('KIDCARE', stampX, stampY - 3, { align: 'center' });
    pdf.text('CHRONICLE', stampX, stampY + 5, { align: 'center' });
    
    // Reset color for footer
    pdf.setTextColor(0, 0, 0);
    
    // Add page numbers to all pages
    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Page ${i} of ${totalPages}`, pageWidth - 25, pageHeight - 15);
    }

    // Footer on last page
    pdf.setPage(totalPages);
    yPosition = pageHeight - 30;
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

export const generateCombinedReport = async (
  children: Child[],
  allRecords: VaccinationRecord[]
): Promise<void> => {
  try {
    console.log('Starting combined PDF generation for', children.length, 'children');
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let yPosition = 20;
    let currentPage = 1;

    // Add logo
    try {
      const logoImg = new Image();
      logoImg.crossOrigin = 'anonymous';
      await new Promise((resolve, reject) => {
        logoImg.onload = resolve;
        logoImg.onerror = reject;
        logoImg.src = '/kidcare.png';
      });
      
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

    // Add border to the page
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.5);
    pdf.rect(10, 10, pageWidth - 20, pageHeight - 20);

    // Header
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('KidCare Chronicle', pageWidth / 2, 25, { align: 'center' });
    yPosition = 35;
    
    pdf.setFontSize(14);
    pdf.text('Combined Vaccination Report', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 20;

    // Summary
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Total Children: ${children.length}`, 20, yPosition);
    yPosition += 6;
    pdf.text(`Total Records: ${allRecords.length}`, 20, yPosition);
    yPosition += 15;

    // Calculate age function
    const calculateAge = (dateOfBirth: Date) => {
      const today = new Date();
      const birthDate = new Date(dateOfBirth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      if (age === 0) {
        const months = (today.getFullYear() - birthDate.getFullYear()) * 12 + today.getMonth() - birthDate.getMonth();
        return months <= 1
          ? `${Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24))} days`
          : `${months} months`;
      }

      return `${age} year${age !== 1 ? "s" : ""}`;
    };

    // Process each child
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      const childRecords = allRecords.filter(r => r.childId === child.id);

      if (yPosition > 230) {
        pdf.addPage();
        currentPage++;
        // Add border to new page
        pdf.rect(10, 10, pageWidth - 20, pageHeight - 20);
        yPosition = 20;
      }

      // Child header
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${i + 1}. ${child.name}`, 20, yPosition);
      yPosition += 10;

      // Child details
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Age: ${calculateAge(child.dateOfBirth)} | Gender: ${child.gender} | DOB: ${format(child.dateOfBirth, 'MM/dd/yyyy')}`, 20, yPosition);
      yPosition += 6;
      pdf.text(`Parent: ${child.parentName} | Contact: ${child.parentContact}`, 20, yPosition);
      yPosition += 10;

      // Vaccination records for this child
      if (childRecords.length > 0) {
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Vaccine', 25, yPosition);
        pdf.text('Dose', 70, yPosition);
        pdf.text('Scheduled', 100, yPosition);
        pdf.text('Status', 140, yPosition);
        yPosition += 6;

        pdf.setFont('helvetica', 'normal');
        childRecords.forEach((record) => {
          if (yPosition > 250) {
            pdf.addPage();
            currentPage++;
            // Add border to new page
            pdf.rect(10, 10, pageWidth - 20, pageHeight - 20);
            yPosition = 20;
          }

          pdf.text(record.vaccineName.substring(0, 12), 25, yPosition);
          pdf.text(record.doseNumber.toString(), 70, yPosition);
          pdf.text(format(record.scheduledDate, 'MM/dd/yy'), 100, yPosition);
          pdf.text(record.status.substring(0, 10), 140, yPosition);
          yPosition += 5;
        });
      } else {
        pdf.text('No vaccination records found.', 25, yPosition);
        yPosition += 6;
      }

      yPosition += 10;
    }

    // Add QR Code in the middle for combined report
    let qrSize = 40; // Define qrSize outside try block
    try {
      const qrData = JSON.stringify({
        type: 'combined_report',
        childrenCount: children.length,
        recordsCount: allRecords.length,
        reportGenerated: new Date().toISOString()
      });
      
      const qrCodeDataURL = await QRCode.toDataURL(qrData, {
        width: 128,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
      
      const qrX = (pageWidth - qrSize) / 2;
      
      if (yPosition + qrSize > 220) {
        pdf.addPage();
        currentPage++;
        // Add border to new page
        pdf.rect(10, 10, pageWidth - 20, pageHeight - 20);
        yPosition = 20;
      }
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Digital Verification', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 10;
      
      pdf.addImage(qrCodeDataURL, 'PNG', qrX, yPosition, qrSize, qrSize);
      
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Scan for digital verification', pageWidth / 2, yPosition + qrSize + 5, { align: 'center' });
      
    } catch (qrError) {
      console.warn('Could not generate QR code for combined PDF:', qrError);
    }

    // Add KidCare Chronicle Stamp (Circle)
    yPosition += qrSize + 20;
    if (yPosition + 50 > pageHeight - 30) {
      pdf.addPage();
      currentPage++;
      // Add border to new page
      pdf.rect(10, 10, pageWidth - 20, pageHeight - 20);
      yPosition = 30;
    }

    // Create circular stamp
    const stampX = pageWidth / 2;
    const stampY = yPosition + 25;
    const stampRadius = 20;
    
    pdf.setDrawColor(41, 98, 255); // Primary color
    pdf.setLineWidth(2);
    pdf.circle(stampX, stampY, stampRadius);
    
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(41, 98, 255);
    pdf.text('KIDCARE', stampX, stampY - 3, { align: 'center' });
    pdf.text('CHRONICLE', stampX, stampY + 5, { align: 'center' });
    
    // Reset color for footer
    pdf.setTextColor(0, 0, 0);
    
    // Add page numbers to all pages
    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Page ${i} of ${totalPages}`, pageWidth - 25, pageHeight - 15);
    }

    // Footer on last page
    pdf.setPage(totalPages);
    yPosition = pageHeight - 30;
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text(
      `Combined Report Generated on ${format(new Date(), 'MMM dd, yyyy HH:mm')}`,
      pageWidth / 2,
      yPosition,
      { align: 'center' }
    );

    // Save the PDF
    console.log('Saving combined PDF...');
    pdf.save(`KidCare_Combined_Report_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    console.log('Combined PDF saved successfully');
  } catch (error) {
    console.error('Error generating combined PDF:', error);
    throw new Error('Failed to generate combined PDF report: ' + (error as Error).message);
  }
};