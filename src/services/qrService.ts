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

export const generateUniqueQR = async (child: Child): Promise<string> => {
  try {
    // Create a unique QR record in Firebase
    const qrData = {
      childId: child.id,
      data: {
        name: child.name,
        dateOfBirth: child.dateOfBirth,
        gender: child.gender,
        parentName: child.parentName,
        parentContact: child.parentContact,
        medicalRecordNumber: child.medicalRecordNumber,
        allergies: child.allergies,
        notes: child.notes,
      },
      isUsed: false,
      createdAt: new Date(),
    };

    const docRef = await addDoc(collection(db, 'qrCodes'), qrData);
    
    // Generate QR code with the document ID
    const qrCodeDataURL = await QRCode.toDataURL(`https://kidcare-qr.app/scan/${docRef.id}`, {
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });

    return qrCodeDataURL;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
};

export const scanQRCode = async (qrId: string): Promise<any> => {
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
    });

    return qrData.data;
  } catch (error) {
    console.error('Error scanning QR code:', error);
    throw error;
  }
};