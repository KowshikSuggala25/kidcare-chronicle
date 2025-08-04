import React from 'react';
import { MoreVertical, CheckCircle, Clock, AlertCircle, XCircle, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { VaccinationRecord, Child } from '@/types';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
// Vaccination notifications would be handled server-side in production

interface VaccinationStatusMenuProps {
  vaccination: VaccinationRecord;
  onStatusChange: (vaccinationId: string, newStatus: string) => void;
  children?: Child[];
}

export const VaccinationStatusMenu: React.FC<VaccinationStatusMenuProps> = ({
  vaccination,
  onStatusChange,
  children = [],
}) => {
  const { toast } = useToast();
  const { userProfile } = useAuth();

  const updateStatus = async (newStatus: "scheduled" | "ongoing" | "completed" | "missed" | "overdue") => {
    try {
      const updateData = {
        status: newStatus,
        updatedAt: new Date(),
        ...(newStatus === 'completed' && { 
          administeredDate: new Date(),
          administeredBy: userProfile?.displayName || 'Healthcare Worker',
          administeredByName: userProfile?.displayName || 'Healthcare Worker',
          healthcareWorkerId: userProfile?.id,
        }),
        ...(newStatus === 'ongoing' && {
          administeredBy: userProfile?.displayName || 'Healthcare Worker',
          administeredByName: userProfile?.displayName || 'Healthcare Worker',
          healthcareWorkerId: userProfile?.id,
        }),
      };

      await updateDoc(doc(db, 'vaccinations', vaccination.id), updateData);

      // In production, notifications would be sent via server-side functions
      console.log('Vaccination status updated:', { vaccination: vaccination.id, status: newStatus });

      onStatusChange(vaccination.id, newStatus);

      toast({
        title: "Status Updated",
        description: `Vaccination status changed to ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating vaccination status:', error);
      toast({
        title: "Error",
        description: "Failed to update vaccination status",
        variant: "destructive",
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => updateStatus('scheduled')} className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Scheduled
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => updateStatus('ongoing')} className="flex items-center gap-2">
          <Play className="h-4 w-4" />
          Ongoing
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => updateStatus('completed')} className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          Completed
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => updateStatus('missed')} className="flex items-center gap-2">
          <XCircle className="h-4 w-4" />
          Missed
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => updateStatus('overdue')} className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          Overdue
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};