import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ChildCard } from "@/components/children/ChildCard";
import { AddChildDialog } from "@/components/children/AddChildDialog";
import { useAuth } from "@/contexts/AuthContext";
import { Child } from "@/types";
import { useToast } from "@/hooks/use-toast";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  getFirestore,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

const Children = () => {
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const { userProfile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchChildren = async () => {
      if (!userProfile) return;

      try {
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
      } catch (error) {
        console.error("Error fetching children:", error);
        toast({
          title: "Error",
          description: "Failed to fetch children data.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchChildren();
  }, [userProfile, toast]);

  const handleChildAdded = async (
    childData: Omit<Child, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      console.log("Saving child:", childData);

      const timestamp = new Date();

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

      toast({
        title: "Success",
        description: "Child added successfully!",
      });
    } catch (error: any) {
      console.error("Firebase error:", error.message || error);
      toast({
        title: "Error",
        description: error.message || "Failed to add child.",
        variant: "destructive",
      });
    }
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {userProfile?.role === "parent"
                ? "Your Children"
                : "All Patients"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {userProfile?.role === "parent"
                ? "Manage your children's vaccination records"
                : "View and manage all patient records"}
            </p>
          </div>
          {userProfile?.role === "parent" && (
            <AddChildDialog onChildAdded={handleChildAdded} />
          )}
        </div>

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
                : "No patients found"}
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
                onGenerateQR={handleGenerateQR}
                onExportPDF={handleExportPDF}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Children;
