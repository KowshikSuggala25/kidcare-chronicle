import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Phone, QrCode, FileText } from "lucide-react";
import { Child } from "@/types";
import { generateUniqueQR } from "@/services/qrService";
import { generatePatientReport } from "@/services/pdfService";
import { getVaccinationRecords } from "@/services/vaccinationService";
import { useToast } from "@/hooks/use-toast";
import { EditChildDialog } from "./EditChildDialog";
import { useAuth } from "@/contexts/AuthContext";

interface ChildCardProps {
  child: Child;
  onViewDetails: (child: Child) => void;
  onChildUpdated?: (child: Child) => void;
}

export const ChildCard: React.FC<ChildCardProps> = ({
  child,
  onViewDetails,
  onChildUpdated,
}) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { userProfile } = useAuth();

  const calculateAge = (dateOfBirth: Date) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    if (age === 0) {
      const months =
        (today.getFullYear() - birthDate.getFullYear()) * 12 +
        today.getMonth() -
        birthDate.getMonth();
      return months <= 1
        ? `${Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24))} days`
        : `${months} months`;
    }

    return `${age} year${age !== 1 ? "s" : ""}`;
  };

  const handleGenerateQR = async () => {
    console.log("QR generation started for child:", child);
    setLoading(true);
    try {
      const qrDataURL = await generateUniqueQR(child);

      // Download the QR code
      const link = document.createElement("a");
      link.href = qrDataURL;
      link.download = `${child.name.replace(/\s+/g, "_")}_qr_code.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "QR Code Generated",
        description: `One-time QR code for ${child.name} has been generated and downloaded.`,
      });
    } catch (error) {
      console.error("QR generation error in component:", error);
      toast({
        title: "Error",
        description: `Failed to generate QR code: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    console.log("PDF generation started for child:", child);
    setLoading(true);
    try {
      const vaccinationRecords = await getVaccinationRecords(child.id);
      await generatePatientReport(child, vaccinationRecords);

      toast({
        title: "PDF Generated",
        description: `Vaccination report for ${child.name} has been generated and downloaded.`,
      });
    } catch (error) {
      console.error("PDF generation error in component:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Unknown error while generating PDF.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="hover:shadow-medical transition-shadow bg-gradient-card border-0">
      <CardHeader className="flex flex-row items-center space-y-0 pb-2">
        <div className="flex items-center space-x-4 flex-1">
          <Avatar className="h-12 w-12">
            <AvatarImage src={child.photoUrl} alt={child.name} />
            <AvatarFallback className="bg-secondary text-secondary-foreground">
              {child.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              {child.name}
            </h3>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{calculateAge(child.dateOfBirth)}</span>
              <Badge variant="outline" className="ml-2 capitalize">
                {child.gender}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Phone className="h-3 w-3" />
          <span>{child.parentContact}</span>
        </div>

        {child.medicalRecordNumber && (
          <div className="text-sm">
            <span className="font-medium">Medical Record: </span>
            <span className="text-muted-foreground">
              {child.medicalRecordNumber}
            </span>
          </div>
        )}

        <div className="flex space-x-2 pt-2">
          <Button
            size="sm"
            variant="medical"
            onClick={() => onViewDetails(child)}
            className="flex-1"
            disabled={loading}
          >
            View Details
          </Button>
          {userProfile?.role === 'parent' && onChildUpdated && (
            <EditChildDialog child={child} onChildUpdated={onChildUpdated} />
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={handleGenerateQR}
            disabled={loading}
            title="Generate One-time QR Code"
          >
            <QrCode className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleExportPDF}
            disabled={loading}
            title="Download PDF Report"
          >
            <FileText className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};