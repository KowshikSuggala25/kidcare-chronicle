import QRCode from 'qrcode';
import { collection, addDoc, updateDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Child } from '@/types';

export interface QRCodeData {
  id: string;
  childId: string;
  data: any;
  isUsed: boolean;
  createdAt: Date;
  usedAt?: Date;
}

export const generateUniqueQR = async (child: Child, healthWorkerName?: string): Promise<string> => {
  try {
    console.log('Starting QR generation for child:', child.name);
    const currentTime = new Date();
    
    // Create a unique QR record in Firebase
    const qrData = {
      childId: child.id,
      data: {
        name: child.name,
        issue: child.allergies?.length ? child.allergies.join(', ') : 'No known allergies',
        parentName: child.parentName,
        parentContact: child.parentContact,
        dateOfBirth: child.dateOfBirth,
        gender: child.gender,
        medicalRecordNumber: child.medicalRecordNumber || 'N/A',
        generatedOn: currentTime.toISOString(),
        generatedBy: healthWorkerName || 'System',
      },
      isUsed: false,
      createdAt: currentTime,
    };

    console.log('QR data created, adding to Firebase...');
    const docRef = await addDoc(collection(db, 'qrCodes'), qrData);
    console.log('QR record saved with ID:', docRef.id);
    
    // Generate QR code with the document ID
    console.log('Generating QR code image...');
    const qrCodeDataURL = await QRCode.toDataURL(`https://kidcare-qr.app/scan/${docRef.id}`, {
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });

    console.log('QR code generated successfully');
    return qrCodeDataURL;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code: ' + (error as Error).message);
  }
};

export const scanQRCode = async (qrId: string, healthWorkerId?: string): Promise<any> => {
  try {
    const qrDoc = await getDoc(doc(db, 'qrCodes', qrId));
    
    if (!qrDoc.exists()) {
      throw new Error('Invalid QR code');
    }

    const qrData = qrDoc.data() as QRCodeData;
    
    if (qrData.isUsed) {
      throw new Error('QR code has already been used');
    }

    // Mark QR code as used
    await updateDoc(doc(db, 'qrCodes', qrId), {
      isUsed: true,
      usedAt: new Date(),
      scannedBy: healthWorkerId,
    });

    // Auto-complete vaccination status if health worker scanned
    if (healthWorkerId) {
      await autoCompleteVaccination(qrData.childId, healthWorkerId);
    }

    return qrData.data;
  } catch (error) {
    console.error('Error scanning QR code:', error);
    throw error;
  }
};

const autoCompleteVaccination = async (childId: string, healthWorkerId: string) => {
  try {
    // Find pending vaccinations for this child
    const { collection, query, where, getDocs, updateDoc, doc } = await import('firebase/firestore');
    
    const vaccinationsQuery = query(
      collection(db, 'vaccinations'),
      where('childId', '==', childId),
      where('status', '==', 'scheduled')
    );
    
    const snapshot = await getDocs(vaccinationsQuery);
    
    // Update the most recent scheduled vaccination to completed
    if (!snapshot.empty) {
      const latestVaccination = snapshot.docs[0];
      await updateDoc(doc(db, 'vaccinations', latestVaccination.id), {
        status: 'completed',
        administeredDate: new Date(),
        healthcareWorkerId: healthWorkerId,
        updatedAt: new Date(),
      });
    }
  } catch (error) {
    console.error('Error auto-completing vaccination:', error);
  }
};