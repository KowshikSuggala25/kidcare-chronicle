import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { VaccinationRecord, Child } from '@/types';

export interface ReportData {
  id?: string;
  reportType: 'vaccination_record' | 'child_profile' | 'medical_summary';
  childId: string;
  childName: string;
  generatedBy: string;
  generatedByName: string;
  content: any;
  createdAt: Date;
  parentId: string;
}

export const saveReport = async (reportData: Omit<ReportData, 'id' | 'createdAt'>): Promise<string> => {
  try {
    const report: Omit<ReportData, 'id'> = {
      ...reportData,
      createdAt: new Date(),
    };
    
    const docRef = await addDoc(collection(db, 'reports'), report);
    console.log('Report saved with ID:', docRef.id);
    
    return docRef.id;
  } catch (error) {
    console.error('Error saving report:', error);
    throw error;
  }
};

export const getReportsByChild = async (childId: string): Promise<ReportData[]> => {
  try {
    const reportsQuery = query(
      collection(db, 'reports'),
      where('childId', '==', childId)
    );
    
    const snapshot = await getDocs(reportsQuery);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
    })) as ReportData[];
  } catch (error) {
    console.error('Error fetching reports:', error);
    return [];
  }
};

export const getReportsByParent = async (parentId: string): Promise<ReportData[]> => {
  try {
    const reportsQuery = query(
      collection(db, 'reports'),
      where('parentId', '==', parentId)
    );
    
    const snapshot = await getDocs(reportsQuery);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
    })) as ReportData[];
  } catch (error) {
    console.error('Error fetching reports:', error);
    return [];
  }
};