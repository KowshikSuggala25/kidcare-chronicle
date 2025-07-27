import { collection, query, where, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { VaccinationRecord, Vaccine } from '@/types';

// Standard vaccination schedule
export const standardVaccines: Vaccine[] = [
  {
    id: 'bcg',
    name: 'BCG',
    description: 'Bacillus Calmette-Guérin vaccine for tuberculosis',
    ageSchedule: { minAge: 0, maxAge: 365, idealAge: 1 },
    doses: 1,
    mandatory: true,
    sideEffects: ['Mild swelling at injection site', 'Small scar formation'],
  },
  {
    id: 'hepatitis-b',
    name: 'Hepatitis B',
    description: 'Hepatitis B vaccine',
    ageSchedule: { minAge: 0, maxAge: 1095, idealAge: 1 },
    doses: 3,
    interval: 30,
    mandatory: true,
    sideEffects: ['Soreness at injection site', 'Mild fever'],
  },
  {
    id: 'dtp',
    name: 'DTP',
    description: 'Diphtheria, Tetanus, and Pertussis vaccine',
    ageSchedule: { minAge: 42, maxAge: 365, idealAge: 45 },
    doses: 5,
    interval: 30,
    mandatory: true,
    sideEffects: ['Mild fever', 'Irritability', 'Swelling at injection site'],
  },
  {
    id: 'polio',
    name: 'Polio (OPV/IPV)',
    description: 'Oral Polio Vaccine / Inactivated Polio Vaccine',
    ageSchedule: { minAge: 42, maxAge: 365, idealAge: 45 },
    doses: 4,
    interval: 30,
    mandatory: true,
    sideEffects: ['Mild fever', 'Fatigue'],
  },
  {
    id: 'hib',
    name: 'Hib',
    description: 'Haemophilus influenzae type b vaccine',
    ageSchedule: { minAge: 42, maxAge: 365, idealAge: 45 },
    doses: 3,
    interval: 60,
    mandatory: true,
    sideEffects: ['Mild fever', 'Swelling at injection site'],
  },
  {
    id: 'mmr',
    name: 'MMR',
    description: 'Measles, Mumps, and Rubella vaccine',
    ageSchedule: { minAge: 365, maxAge: 730, idealAge: 365 },
    doses: 2,
    interval: 90,
    mandatory: true,
    sideEffects: ['Mild fever', 'Rash', 'Temporary joint pain'],
  },
];

export const createVaccinationSchedule = async (childId: string, dateOfBirth: Date) => {
  try {
    const schedulePromises = standardVaccines.map(async (vaccine) => {
      for (let dose = 1; dose <= vaccine.doses; dose++) {
        let scheduledDate = new Date(dateOfBirth);
        
        if (dose === 1) {
          scheduledDate.setDate(scheduledDate.getDate() + vaccine.ageSchedule.idealAge);
        } else if (vaccine.interval) {
          scheduledDate.setDate(scheduledDate.getDate() + vaccine.ageSchedule.idealAge + (vaccine.interval * (dose - 1)));
        }

        const vaccinationRecord: Omit<VaccinationRecord, 'id'> = {
          childId,
          vaccineId: vaccine.id,
          vaccineName: vaccine.name,
          doseNumber: dose,
          scheduledDate,
          status: 'scheduled',
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await addDoc(collection(db, 'vaccinations'), vaccinationRecord);
      }
    });

    await Promise.all(schedulePromises);
  } catch (error) {
    console.error('Error creating vaccination schedule:', error);
    throw new Error('Failed to create vaccination schedule');
  }
};

export const getVaccinationRecords = async (childId: string): Promise<VaccinationRecord[]> => {
  try {
    console.log('Fetching vaccination records for child:', childId);
    const q = query(
      collection(db, 'vaccinations'),
      where('childId', '==', childId)
    );
    
    const querySnapshot = await getDocs(q);
    console.log('Found vaccination records:', querySnapshot.docs.length);
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        scheduledDate: data.scheduledDate.toDate(),
        administeredDate: data.administeredDate?.toDate(),
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as VaccinationRecord;
    });
  } catch (error) {
    console.error('Error fetching vaccination records:', error);
    throw new Error('Failed to fetch vaccination records');
  }
};

export const markVaccinationComplete = async (
  recordId: string,
  administeredBy: string,
  location: string,
  batchNumber?: string,
  notes?: string
) => {
  try {
    await updateDoc(doc(db, 'vaccinations', recordId), {
      status: 'completed',
      administeredDate: new Date(),
      administeredBy,
      location,
      batchNumber,
      notes,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error marking vaccination complete:', error);
    throw new Error('Failed to mark vaccination as complete');
  }
};

export const getUpcomingVaccinations = async (childId: string): Promise<VaccinationRecord[]> => {
  try {
    const records = await getVaccinationRecords(childId);
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    return records.filter(
      (record) =>
        record.status === 'scheduled' &&
        record.scheduledDate >= now &&
        record.scheduledDate <= thirtyDaysFromNow
    );
  } catch (error) {
    console.error('Error fetching upcoming vaccinations:', error);
    throw new Error('Failed to fetch upcoming vaccinations');
  }
};

export const getVaccinationStats = async (childId: string) => {
  try {
    const records = await getVaccinationRecords(childId);
    
    const completed = records.filter((r) => r.status === 'completed').length;
    const upcoming = records.filter((r) => {
      const now = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(now.getDate() + 30);
      return r.status === 'scheduled' && r.scheduledDate >= now && r.scheduledDate <= thirtyDaysFromNow;
    }).length;
    const overdue = records.filter((r) => {
      const now = new Date();
      return r.status === 'scheduled' && r.scheduledDate < now;
    }).length;

    return { completed, upcoming, overdue, total: records.length };
  } catch (error) {
    console.error('Error fetching vaccination stats:', error);
    throw new Error('Failed to fetch vaccination statistics');
  }
};