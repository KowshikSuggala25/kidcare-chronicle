import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ChildCard } from "../components/children/ChildCard";
import { AddChildDialog } from "@/components/children/AddChildDialog";
import { useAuth } from "@/contexts/AuthContext";
import { Child } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getVaccinationStats } from "@/services/vaccinationService";
import { PatientDetailsModal } from "@/components/patient/PatientDetailsModal";

const Dashboard = () => {
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ completed: 0, upcoming: 0, overdue: 0 });
  const { userProfile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      if (!userProfile) return;

      try {
        // Fetch children
        let q;
        if (userProfile.role === "parent") {
          q = query(
            collection(db, "children"),
            where("parentId", "==", userProfile.id)
          );
        } else {
          q = query(collection(db, "children"));
        }

        const querySnapshot = await getDocs(q);
        const childrenData = querySnapshot.docs.map((doc) => {
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

        // Calculate vaccination stats for all children
        let totalCompleted = 0;
        let totalUpcoming = 0;
        let totalOverdue = 0;

        for (const child of childrenData) {
          try {
            const childStats = await getVaccinationStats(child.id);
            totalCompleted += childStats.completed;
            totalUpcoming += childStats.upcoming;
            totalOverdue += childStats.overdue;
          } catch (error) {
            console.error(`Error fetching stats for child ${child.id}:`, error);
          }
        }

        setStats({
          completed: totalCompleted,
          upcoming: totalUpcoming,
          overdue: totalOverdue,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast({
          title: "Error",
          description: "Failed to fetch dashboard data.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userProfile, toast]);

  const handleChildAdded = async (
    childData: Omit<Child, "id" | "createdAt" | "updatedAt">
  ): Promise<string | void> => {
    try {
      const timestamp = new Date();
      const cleanData = Object.fromEntries(
        Object.entries(childData).filter(([_, v]) => v !== undefined)
      );
      const docRef = await addDoc(collection(db, "children"), {
        ...childData,
        createdAt: timestamp,
        updatedAt: timestamp,
      });

      const newChild: Child = {
        id: docRef.id,
        ...childData,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      setChildren((prev) => [...prev, newChild]);
      return docRef.id;
    } catch (error: any) {
      console.error("Firebase error:", error.message || error);
      toast({
        title: "Error",
        description: error.message || "Failed to add child.",
        variant: "destructive",
      });
    }
  };

  const [selectedPatient, setSelectedPatient] = useState<Child | null>(null);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);

  const handleViewDetails = (child: Child) => {
    setSelectedPatient(child);
    setIsPatientModalOpen(true);
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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Welcome back, {userProfile?.displayName}
            </h1>
            <p className="text-muted-foreground mt-1">
              {userProfile?.role === "parent"
                ? "Manage your children's vaccination records"
                : "Access patient vaccination records"}
            </p>
          </div>
          {userProfile?.role === "parent" && (
            <AddChildDialog onChildAdded={handleChildAdded} />
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-card rounded-lg p-6 shadow-soft border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Children
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {children.length}
                </p>
              </div>
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <svg
                  className="h-6 w-6 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-card rounded-lg p-6 shadow-soft border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Upcoming Vaccines
                </p>
                <p className="text-2xl font-bold text-warning">
                  {stats.upcoming}
                </p>
              </div>
              <div className="h-12 w-12 bg-warning/10 rounded-lg flex items-center justify-center">
                <svg
                  className="h-6 w-6 text-warning"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-card rounded-lg p-6 shadow-soft border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Completed Vaccines
                </p>
                <p className="text-2xl font-bold text-success">
                  {stats.completed}
                </p>
              </div>
              <div className="h-12 w-12 bg-success/10 rounded-lg flex items-center justify-center">
                <svg
                  className="h-6 w-6 text-success"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Children List */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            {userProfile?.role === "parent"
              ? "Your Children"
              : "Recent Patients"}
          </h2>

          {children.length === 0 ? (
            <div className="text-center py-12 bg-gradient-card rounded-lg border">
              <svg
                className="mx-auto h-12 w-12 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-foreground">
                {userProfile?.role === "parent"
                  ? "No children added yet"
                  : "No patient records added yet"}
              </h3>
              <p className="mt-2 text-muted-foreground">
                {userProfile?.role === "parent"
                  ? "Add your first child to start tracking their vaccination journey."
                  : "Patient records will appear here once added."}
              </p>
              {userProfile?.role === "parent" && (
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
                />
              ))}
            </div>
          )}
        </div>

        <PatientDetailsModal
          child={selectedPatient}
          isOpen={isPatientModalOpen}
          onClose={() => {
            setIsPatientModalOpen(false);
            setSelectedPatient(null);
          }}
        />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;