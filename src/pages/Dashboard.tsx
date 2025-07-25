import React, { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { ChildCard } from '@/components/children/ChildCard';
import { AddChildDialog } from '@/components/children/AddChildDialog';
import { useAuth } from '@/contexts/AuthContext';
import { Child } from '@/types';
import { useToast } from '@/hooks/use-toast';

const Dashboard = () => {
  const [children, setChildren] = useState<Child[]>([]);
  const { userProfile } = useAuth();
  const { toast } = useToast();

  const handleChildAdded = (childData: Omit<Child, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newChild: Child = {
      id: crypto.randomUUID(),
      ...childData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setChildren(prev => [...prev, newChild]);
  };

  const handleViewDetails = (child: Child) => {
    toast({
      title: "Feature Coming Soon",
      description: "Child details view will be available in the next update.",
    });
  };

  const handleGenerateQR = (child: Child) => {
    toast({
      title: "QR Code Generated",
      description: `QR code for ${child.name} has been generated.`,
    });
  };

  const handleExportPDF = (child: Child) => {
    toast({
      title: "PDF Export",
      description: `Vaccination report for ${child.name} is being prepared.`,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Welcome back, {userProfile?.displayName}
            </h1>
            <p className="text-muted-foreground mt-1">
              {userProfile?.role === 'parent' 
                ? 'Manage your children\'s vaccination records' 
                : 'Access patient vaccination records'
              }
            </p>
          </div>
          {userProfile?.role === 'parent' && (
            <AddChildDialog onChildAdded={handleChildAdded} />
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-card rounded-lg p-6 shadow-soft border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Children</p>
                <p className="text-2xl font-bold text-foreground">{children.length}</p>
              </div>
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-card rounded-lg p-6 shadow-soft border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Upcoming Vaccines</p>
                <p className="text-2xl font-bold text-warning">3</p>
              </div>
              <div className="h-12 w-12 bg-warning/10 rounded-lg flex items-center justify-center">
                <svg className="h-6 w-6 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-card rounded-lg p-6 shadow-soft border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed Vaccines</p>
                <p className="text-2xl font-bold text-success">12</p>
              </div>
              <div className="h-12 w-12 bg-success/10 rounded-lg flex items-center justify-center">
                <svg className="h-6 w-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Children List */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            {userProfile?.role === 'parent' ? 'Your Children' : 'Recent Patients'}
          </h2>
          
          {children.length === 0 ? (
            <div className="text-center py-12 bg-gradient-card rounded-lg border">
              <svg className="mx-auto h-12 w-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-foreground">No children added yet</h3>
              <p className="mt-2 text-muted-foreground">
                {userProfile?.role === 'parent' 
                  ? 'Add your first child to start tracking their vaccination journey.'
                  : 'Patient records will appear here once added.'
                }
              </p>
              {userProfile?.role === 'parent' && (
                <div className="mt-6">
                  <AddChildDialog onChildAdded={handleChildAdded} />
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {children.map((child) => (
                <ChildCard
                  key={child.id}
                  child={child}
                  onViewDetails={handleViewDetails}
                  onGenerateQR={handleGenerateQR}
                  onExportPDF={handleExportPDF}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;