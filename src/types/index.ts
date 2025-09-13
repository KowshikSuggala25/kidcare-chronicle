export type Language = 'en' | 'hi' | 'te' | 'ta' | 'ml';

export interface User {
  id: string;
  email: string;
  phoneNumber: string;
  displayName: string;
  photoURL?: string;
  role: 'parent' | 'healthcare_worker';
  language?: Language;
  createdAt: Date | any;
  updatedAt: Date | any;
  passwordChangedAt?: Date | any;
  phoneVerified?: boolean;
}

export interface Child {
  id: string;
  name: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  photoUrl?: string;
  parentId: string;
  parentName: string;
  parentContact: string;
  medicalRecordNumber?: string;
  allergies?: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Vaccine {
  id: string;
  name: string;
  description: string;
  ageSchedule: {
    minAge: number; // in days
    maxAge: number; // in days
    idealAge: number; // in days
  };
  doses: number;
  interval?: number; // days between doses
  sideEffects?: string[];
  mandatory: boolean;
}

export interface VaccinationRecord {
  id: string;
  childId: string;
  vaccineId: string;
  vaccineName: string;
  doseNumber: number;
  scheduledDate: Date;
  administeredDate?: Date;
  administeredBy?: string;
  administeredByName?: string;
  healthcareWorkerId?: string;
  location?: string;
  batchNumber?: string;
  status: 'scheduled' | 'ongoing' | 'completed' | 'missed' | 'overdue';
  notes?: string;
  sideEffectsReported?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Reminder {
  id: string;
  childId: string;
  vaccinationRecordId: string;
  type: 'push' | 'sms' | 'email';
  scheduledDate: Date;
  message: string;
  language: string;
  sent: boolean;
  sentAt?: Date;
  createdAt: Date;
}