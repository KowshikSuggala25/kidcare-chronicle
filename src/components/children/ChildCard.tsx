import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, MapPin, Phone, QrCode, FileText } from 'lucide-react';
import { Child } from '@/types';

interface ChildCardProps {
  child: Child;
  onViewDetails: (child: Child) => void;
  onGenerateQR: (child: Child) => void;
  onExportPDF: (child: Child) => void;
}

export const ChildCard: React.FC<ChildCardProps> = ({ 
  child, 
  onViewDetails, 
  onGenerateQR, 
  onExportPDF 
}) => {
  const calculateAge = (dateOfBirth: Date) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    if (age === 0) {
      const months = today.getMonth() - birthDate.getMonth() + 
        (12 * (today.getFullYear() - birthDate.getFullYear()));
      return months <= 1 ? `${Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24))} days` : `${months} months`;
    }
    
    return `${age} year${age !== 1 ? 's' : ''}`;
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
            <h3 className="text-lg font-semibold text-foreground">{child.name}</h3>
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
            <span className="text-muted-foreground">{child.medicalRecordNumber}</span>
          </div>
        )}

        <div className="flex space-x-2 pt-2">
          <Button 
            size="sm" 
            variant="medical" 
            onClick={() => onViewDetails(child)}
            className="flex-1"
          >
            View Details
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => onGenerateQR(child)}
          >
            <QrCode className="h-4 w-4" />
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => onExportPDF(child)}
          >
            <FileText className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};