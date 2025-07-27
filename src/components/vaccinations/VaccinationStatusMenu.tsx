import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, Clock, CheckCircle, Calendar } from "lucide-react";
import { VaccinationRecord } from "@/types";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

interface VaccinationStatusMenuProps {
  vaccination: VaccinationRecord;
  onStatusChange: (id: string, newStatus: string) => void;
}

export const VaccinationStatusMenu: React.FC<VaccinationStatusMenuProps> = ({
  vaccination,
  onStatusChange,
}) => {
  const { toast } = useToast();

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateDoc(doc(db, "vaccinations", vaccination.id), {
        status: newStatus,
        updatedAt: new Date(),
        ...(newStatus === "completed" && {
          administeredDate: new Date(),
        }),
      });

      onStatusChange(vaccination.id, newStatus);

      toast({
        title: "Status Updated",
        description: `Vaccination status changed to ${newStatus}`,
      });
    } catch (error) {
      console.error("Error updating vaccination status:", error);
      toast({
        title: "Error",
        description: "Failed to update vaccination status",
        variant: "destructive",
      });
    }
  };

  const statusOptions = [
    {
      value: "scheduled",
      label: "Scheduled",
      icon: Calendar,
      description: "Vaccination is scheduled",
    },
    {
      value: "ongoing",
      label: "Ongoing",
      icon: Clock,
      description: "Vaccination in progress",
    },
    {
      value: "completed",
      label: "Completed",
      icon: CheckCircle,
      description: "Vaccination completed",
    },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-muted"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {statusOptions.map((option) => {
          const Icon = option.icon;
          const isCurrentStatus = vaccination.status === option.value;
          
          return (
            <DropdownMenuItem
              key={option.value}
              onClick={() => handleStatusChange(option.value)}
              disabled={isCurrentStatus}
              className={`flex items-center space-x-2 ${
                isCurrentStatus ? "bg-muted" : ""
              }`}
            >
              <Icon className="h-4 w-4" />
              <div>
                <p className="font-medium">{option.label}</p>
                <p className="text-xs text-muted-foreground">
                  {option.description}
                </p>
              </div>
              {isCurrentStatus && (
                <div className="ml-auto h-2 w-2 bg-primary rounded-full" />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};