import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { VaccinationRecord, Child } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const Records = () => {
  const [records, setRecords] = useState<VaccinationRecord[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const { userProfile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      if (!userProfile) return;

    const [selectedChild, setSelectedChild] = useState<string>("all");
    const [selectedMonth, setSelectedMonth] = useState<string>("all");
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
        if (userProfile.role === "parent") {
          childrenQuery = query(
            collection(db, "children"),
            where("parentId", "==", userProfile.id)
          );
        } else {
          childrenQuery = query(collection(db, "children"));
        }

        const childrenSnapshot = await getDocs(childrenQuery);
        const childrenData = childrenSnapshot.docs.map((doc) => {
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

        // Fetch vaccination records
        if (childrenData.length > 0) {
          const childIds = childrenData.map((child) => child.id);
          const recordsQuery = query(
            collection(db, "vaccinations"),
            where("childId", "in", childIds)
          );

          const recordsSnapshot = await getDocs(recordsQuery);
          const recordsData = recordsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            scheduledDate: doc.data().scheduledDate.toDate(),
            administeredDate: doc.data().administeredDate?.toDate(),
            createdAt: doc.data().createdAt.toDate(),
            updatedAt: doc.data().updatedAt.toDate(),
          })) as VaccinationRecord[];

          setRecords(recordsData);
        }
      } catch (error) {
        console.error("Error fetching records:", error);
        toast({
          title: "Error",
          description: "Failed to fetch vaccination records.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userProfile, toast]);

  const filteredRecords =
    selectedChild === "all"
      ? records
      : records.filter((record) => record.childId === selectedChild);

  const handleExportRecords = async (childId?: string) => {
    try {
      if (childId) {
        // Export specific child's records
<<<<<<< HEAD
        const child = children.find(c => c.id === childId);
=======
        const child = children.find((c) => c.id === childId);
>>>>>>> 0f3274a6429c14c465711ac7d7d91d08a8a892df
        if (!child) {
          toast({
            title: "Error",
            description: "Child not found.",
            variant: "destructive",
          });
          return;
        }
<<<<<<< HEAD
        
        const childRecords = records.filter(r => r.childId === childId);
        const { generatePatientReport } = await import('@/services/pdfService');
        await generatePatientReport(child, childRecords);
        
=======

        const childRecords = records.filter((r) => r.childId === childId);
        const { generatePatientReport } = await import("@/services/pdfService");
        await generatePatientReport(child, childRecords);

>>>>>>> 0f3274a6429c14c465711ac7d7d91d08a8a892df
        toast({
          title: "Export Complete",
          description: `${child.name}'s vaccination report has been downloaded.`,
        });
      } else {
        // Export all records in one combined report
<<<<<<< HEAD
        const { generateCombinedReport } = await import('@/services/pdfService');
        await generateCombinedReport(children, records);
        
        toast({
          title: "Export Complete",
          description: "Combined vaccination report for all children has been downloaded.",
        });
      }
    } catch (error) {
      console.error('Error exporting records:', error);
=======
        const { generateCombinedReport } = await import(
          "@/services/pdfService"
        );
        await generateCombinedReport(children, records);

        toast({
          title: "Export Complete",
          description:
            "Combined vaccination report for all children has been downloaded.",
        });
      }
    } catch (error) {
      console.error("Error exporting records:", error);
>>>>>>> 0f3274a6429c14c465711ac7d7d91d08a8a892df
      toast({
        title: "Export Failed",
        description: "Failed to generate PDF report. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getCompletionRate = (childId: string) => {
    const childRecords = records.filter((r) => r.childId === childId);
    const completed = childRecords.filter(
      (r) => r.status === "completed"
    ).length;
    return childRecords.length > 0
      ? Math.round((completed / childRecords.length) * 100)
      : 0;
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
              Vaccination Records
            </h1>
            <p className="text-muted-foreground mt-1">
              Complete vaccination history and reports
            </p>
          </div>
          <Button onClick={() => handleExportRecords()}>
            Export All Records
          </Button>
        </div>

<<<<<<< HEAD
=======
        {/* Child Filter */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedChild === "all" ? "default" : "outline"}
            onClick={() => setSelectedChild("all")}
          >
            All Children
          </Button>
          {children.map((child) => (
            <Button
              key={child.id}
              variant={selectedChild === child.id ? "default" : "outline"}
              onClick={() => setSelectedChild(child.id)}
            >
              {child.name}
            </Button>
          ))}
        </div>
>>>>>>> 0f3274a6429c14c465711ac7d7d91d08a8a892df

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(selectedChild === "all"
            ? children
            : children.filter((c) => c.id === selectedChild)
          ).map((child) => (
            <Card key={child.id}>
              <CardHeader>
                <CardTitle className="text-lg">{child.name}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Born: {format(child.dateOfBirth, "PPP")}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Completion Rate
                    </span>
                    <Badge variant="secondary">
                      {getCompletionRate(child.id)}%
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Total Records
                    </span>
                    <span className="text-sm font-medium">
                      {records.filter((r) => r.childId === child.id).length}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    className="w-full mt-4"
                    onClick={() => handleExportRecords(child.id)}
                  >
                    Export {child.name}'s Records
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Records List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            Detailed Records
          </h2>
          {filteredRecords.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <svg
                  className="h-12 w-12 text-muted-foreground mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 className="text-lg font-medium text-foreground">
                  No records found
                </h3>
                <p className="text-muted-foreground">
                  No vaccination records match your current filter.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredRecords
                .sort(
                  (a, b) =>
                    new Date(b.scheduledDate).getTime() -
                    new Date(a.scheduledDate).getTime()
                )
                .map((record) => (
                  <Card key={record.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-medium text-foreground">
                            {record.vaccineName} - Dose {record.doseNumber}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {getChildName(record.childId)}
                          </p>
                        </div>
                        <Badge
                          variant={
                            record.status === "completed"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {record.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-foreground">
                            Scheduled:
                          </span>
                          <p className="text-muted-foreground">
                            {format(record.scheduledDate, "PPP")}
                          </p>
                        </div>
                        {record.administeredDate && (
                          <div>
                            <span className="font-medium text-foreground">
                              Administered:
                            </span>
                            <p className="text-muted-foreground">
                              {format(record.administeredDate, "PPP")}
                            </p>
                          </div>
                        )}
                        {record.administeredBy && (
                          <div>
                            <span className="font-medium text-foreground">
                              Healthcare Provider:
                            </span>
                            <p className="text-muted-foreground">
                              {record.administeredBy}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Records;
