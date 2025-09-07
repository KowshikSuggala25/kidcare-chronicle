import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { VaccinationRecord, Child } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
<<<<<<< HEAD
import { VaccinationStatusMenu } from '@/components/vaccinations/VaccinationStatusMenu';
import { Calendar, Filter } from 'lucide-react';
=======
import { VaccinationStatusMenu } from '../components/vaccinations/VaccinationStatusMenu';
>>>>>>> 0f3274a6429c14c465711ac7d7d91d08a8a892df

const Vaccinations = () => {
  const [vaccinations, setVaccinations] = useState<VaccinationRecord[]>([]);
  const [filteredVaccinations, setFilteredVaccinations] = useState<VaccinationRecord[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [monthFilter, setMonthFilter] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('');
  const { userProfile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      if (!userProfile) return;
      
      try {
        // Fetch children based on user role
        let childrenQuery;
        if (userProfile.role === 'parent') {
          childrenQuery = query(collection(db, 'children'), where('parentId', '==', userProfile.id));
        } else {
          childrenQuery = query(collection(db, 'children'));
        }
        
        const childrenSnapshot = await getDocs(childrenQuery);
        const childrenData = childrenSnapshot.docs.map(doc => {
          const data = doc.data() as any;
          return {
            id: doc.id,
            name: data.name,
            dateOfBirth: data.dateOfBirth.toDate(),
            gender: data.gender,
            parentId: data.parentId,
            parentName: data.parentName,
            parentContact: data.parentContact,
            medicalRecordNumber: data.medicalRecordNumber,
            allergies: data.allergies,
            notes: data.notes,
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt.toDate(),
          } as Child;
        });
        
        setChildren(childrenData);

        // Fetch vaccination records for these children
        if (childrenData.length > 0) {
          const childIds = childrenData.map(child => child.id);
          const vaccinationsQuery = query(
            collection(db, 'vaccinations'),
            where('childId', 'in', childIds)
          );
          
          const vaccinationsSnapshot = await getDocs(vaccinationsQuery);
          const vaccinationsData = vaccinationsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            scheduledDate: doc.data().scheduledDate.toDate(),
            administeredDate: doc.data().administeredDate?.toDate(),
            createdAt: doc.data().createdAt.toDate(),
            updatedAt: doc.data().updatedAt.toDate(),
          })) as VaccinationRecord[];
          
          setVaccinations(vaccinationsData);
          setFilteredVaccinations(vaccinationsData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "Failed to fetch vaccination data.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userProfile, toast]);

  useEffect(() => {
    let filtered = [...vaccinations];
    
    // Apply month filter
    if (monthFilter) {
      const month = parseInt(monthFilter);
      filtered = filtered.filter(v => 
        v.scheduledDate.getMonth() === month
      );
    }
    
    // Apply date filter
    if (dateFilter) {
      const selectedDate = new Date(dateFilter);
      filtered = filtered.filter(v => 
        v.scheduledDate.toDateString() === selectedDate.toDateString()
      );
    }
    
    // Sort by date
    filtered.sort((a, b) => a.scheduledDate.getTime() - b.scheduledDate.getTime());
    
    setFilteredVaccinations(filtered);
  }, [vaccinations, monthFilter, dateFilter]);

  const getChildName = (childId: string) => {
    const child = children.find(c => c.id === childId);
    return child?.name || 'Unknown Child';
  };

  const handleStatusChange = (vaccinationId: string, newStatus: string) => {
<<<<<<< HEAD
    const updatedVaccinations = vaccinations.map(v => 
      v.id === vaccinationId 
        ? { ...v, status: newStatus as "scheduled" | "ongoing" | "completed" | "missed" | "overdue", updatedAt: new Date() }
        : v
    );
    setVaccinations(updatedVaccinations);
  };

  const handleSearchResults = (results: VaccinationRecord[]) => {
    setFilteredVaccinations(results);
  };

  const clearFilters = () => {
    setMonthFilter('');
    setDateFilter('');
    setFilteredVaccinations(vaccinations);
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

=======
    setVaccinations(prev => 
      prev.map(v => 
        v.id === vaccinationId 
          ? { ...v, status: newStatus as "scheduled" | "completed" | "missed" | "overdue", updatedAt: new Date() }
          : v
      )
    );
  };

>>>>>>> 0f3274a6429c14c465711ac7d7d91d08a8a892df
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'scheduled':
        return 'secondary';
      case 'ongoing':
        return 'default';
      case 'overdue':
        return 'destructive';
      case 'missed':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Vaccinations</h1>
          <p className="text-muted-foreground mt-1">
            Track vaccination schedules and records
          </p>
        </div>


        <div className="grid gap-6">
          {filteredVaccinations.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <svg className="h-12 w-12 text-muted-foreground mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-lg font-medium text-foreground">No vaccination records found</h3>
                <p className="text-muted-foreground">Vaccination records will appear here once children are added.</p>
              </CardContent>
            </Card>
          ) : (
            filteredVaccinations.map((vaccination) => (
              <Card key={vaccination.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {vaccination.vaccineName} - Dose {vaccination.doseNumber}
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getStatusVariant(vaccination.status)}>
                        {vaccination.status}
                      </Badge>
                      {userProfile?.role === 'healthcare_worker' && (
                        <VaccinationStatusMenu 
                          vaccination={vaccination}
                          onStatusChange={handleStatusChange}
<<<<<<< HEAD
                          children={children}
=======
>>>>>>> 0f3274a6429c14c465711ac7d7d91d08a8a892df
                        />
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Child: {getChildName(vaccination.childId)}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">Scheduled Date</p>
                      <p className="text-sm text-muted-foreground">
                        {format(vaccination.scheduledDate, 'PPP')}
                      </p>
                    </div>
                    {vaccination.administeredDate && (
                      <div>
                        <p className="text-sm font-medium text-foreground">Administered Date</p>
                        <p className="text-sm text-muted-foreground">
                          {format(vaccination.administeredDate, 'PPP')}
                        </p>
                      </div>
                    )}
                    {vaccination.administeredBy && (
                      <div>
                        <p className="text-sm font-medium text-foreground">Administered By</p>
                        <p className="text-sm text-muted-foreground">
                          {vaccination.administeredByName || vaccination.administeredBy || 'N/A'}
                        </p>
                      </div>
                    )}
                    {vaccination.location && (
                      <div>
                        <p className="text-sm font-medium text-foreground">Location</p>
                        <p className="text-sm text-muted-foreground">{vaccination.location}</p>
                      </div>
                    )}
                    {vaccination.notes && (
                      <div className="md:col-span-2">
                        <p className="text-sm font-medium text-foreground">Notes</p>
                        <p className="text-sm text-muted-foreground">{vaccination.notes}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Vaccinations;