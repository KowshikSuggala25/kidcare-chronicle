import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Child, VaccinationRecord } from '@/types';
import { format, differenceInYears, differenceInMonths } from 'date-fns';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { X, User, Calendar, Phone, FileText, Stethoscope } from 'lucide-react';

interface PatientDetailsModalProps {
  child: Child | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PatientDetailsModal: React.FC<PatientDetailsModalProps> = ({
  child,
  isOpen,
  onClose,
}) => {
  const [vaccinationRecords, setVaccinationRecords] = useState<VaccinationRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchVaccinationRecords = async () => {
      if (!child) return;
      
      setLoading(true);
      try {
        const recordsQuery = query(
          collection(db, 'vaccinations'),
          where('childId', '==', child.id)
        );
        
        const recordsSnapshot = await getDocs(recordsQuery);
        const recordsData = recordsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          scheduledDate: doc.data().scheduledDate.toDate(),
          administeredDate: doc.data().administeredDate?.toDate(),
          createdAt: doc.data().createdAt.toDate(),
          updatedAt: doc.data().updatedAt.toDate(),
        })) as VaccinationRecord[];
        
        setVaccinationRecords(recordsData.sort((a, b) => 
          new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime()
        ));
      } catch (error) {
        console.error('Error fetching vaccination records:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && child) {
      fetchVaccinationRecords();
    }
  }, [isOpen, child]);

  if (!child) return null;

  const calculateAge = (dateOfBirth: Date) => {
    const today = new Date();
    const years = differenceInYears(today, dateOfBirth);
    const months = differenceInMonths(today, dateOfBirth) % 12;
    
    if (years > 0) {
      return `${years} year${years > 1 ? 's' : ''} ${months > 0 ? `${months} month${months > 1 ? 's' : ''}` : ''}`;
    }
    return `${months} month${months > 1 ? 's' : ''}`;
  };

  const getVaccinationStats = () => {
    const completed = vaccinationRecords.filter(record => record.status === 'completed').length;
    const upcoming = vaccinationRecords.filter(record => record.status === 'scheduled').length;
    const overdue = vaccinationRecords.filter(record => record.status === 'overdue').length;
    
    return { completed, upcoming, overdue, total: vaccinationRecords.length };
  };

  const stats = getVaccinationStats();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden bg-background/95 backdrop-blur-xl border border-border/50 shadow-2xl">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-border/50">
          <DialogTitle className="text-2xl font-bold text-foreground flex items-center gap-3">
            <div className="h-12 w-12 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-primary-foreground" />
            </div>
            Patient Details
          </DialogTitle>
<<<<<<< HEAD
=======
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="h-8 w-8 p-0 rounded-full hover:bg-muted/50"
          >
            <X className="h-4 w-4" />
          </Button>
>>>>>>> 0f3274a6429c14c465711ac7d7d91d08a8a892df
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 py-6 max-h-[calc(90vh-8rem)] overflow-y-auto">
          {/* Patient Information */}
          <div className="lg:col-span-1 space-y-6">
            {/* Basic Info Card */}
            <div className="bg-gradient-card rounded-xl p-6 border border-border/50 shadow-soft">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Basic Information
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                  <p className="text-foreground font-medium">{child.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Age</label>
                  <p className="text-foreground">{calculateAge(child.dateOfBirth)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Date of Birth</label>
                  <p className="text-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    {format(child.dateOfBirth, 'PPP')}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Gender</label>
                  <p className="text-foreground capitalize">{child.gender}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Medical Record Number</label>
                  <p className="text-foreground font-mono">{child.medicalRecordNumber}</p>
                </div>
              </div>
            </div>

            {/* Parent Information Card */}
            <div className="bg-gradient-card rounded-xl p-6 border border-border/50 shadow-soft">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Phone className="h-5 w-5 text-primary" />
                Parent Information
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Parent Name</label>
                  <p className="text-foreground">{child.parentName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Contact</label>
                  <p className="text-foreground">{child.parentContact}</p>
                </div>
              </div>
            </div>

            {/* Medical Information Card */}
            {(child.allergies || child.notes) && (
              <div className="bg-gradient-card rounded-xl p-6 border border-border/50 shadow-soft">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-primary" />
                  Medical Information
                </h3>
                <div className="space-y-3">
                  {child.allergies && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Allergies</label>
                      <p className="text-foreground">{child.allergies}</p>
                    </div>
                  )}
                  {child.notes && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Notes</label>
                      <p className="text-foreground">{child.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Vaccination Records */}
          <div className="lg:col-span-2 space-y-6">
            {/* Vaccination Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-card rounded-lg p-4 border border-border/50 text-center">
                <div className="text-2xl font-bold text-primary">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Total</div>
              </div>
              <div className="bg-gradient-card rounded-lg p-4 border border-border/50 text-center">
                <div className="text-2xl font-bold text-success">{stats.completed}</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
              <div className="bg-gradient-card rounded-lg p-4 border border-border/50 text-center">
                <div className="text-2xl font-bold text-destructive">{stats.overdue}</div>
                <div className="text-sm text-muted-foreground">Overdue</div>
              </div>
              <div className="bg-gradient-card rounded-lg p-4 border border-border/50 text-center">
                <div className="text-2xl font-bold text-info">{stats.upcoming}</div>
                <div className="text-sm text-muted-foreground">Scheduled</div>
              </div>
            </div>

            {/* Vaccination Records List */}
            <div className="bg-gradient-card rounded-xl p-6 border border-border/50 shadow-soft">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Vaccination History
              </h3>
              
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : vaccinationRecords.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-muted-foreground">No vaccination records found</div>
                </div>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {vaccinationRecords.map((record) => (
                    <div 
                      key={record.id} 
                      className="bg-background/50 rounded-lg p-4 border border-border/30"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-foreground">
                          {record.vaccineName} - Dose {record.doseNumber}
                        </h4>
                        <Badge 
                          variant={
                            record.status === 'completed' ? 'default' : 
                            record.status === 'overdue' ? 'destructive' : 'outline'
                          }
                        >
                          {record.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Scheduled:</span>
                          <span className="ml-2 text-foreground">
                            {format(record.scheduledDate, 'PPP')}
                          </span>
                        </div>
                        {record.administeredDate && (
                          <div>
                            <span className="text-muted-foreground">Administered:</span>
                            <span className="ml-2 text-foreground">
                              {format(record.administeredDate, 'PPP')}
                            </span>
                          </div>
                        )}
                        {record.administeredBy && (
                          <div className="md:col-span-2">
                            <span className="text-muted-foreground">By:</span>
                            <span className="ml-2 text-foreground">{record.administeredBy}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};