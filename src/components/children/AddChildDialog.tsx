import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Baby } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Child } from '@/types';

interface AddChildDialogProps {
  onChildAdded: (child: Omit<Child, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export const AddChildDialog: React.FC<AddChildDialogProps> = ({ onChildAdded }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    dateOfBirth: '',
    gender: 'male' as 'male' | 'female' | 'other',
    parentContact: '',
    medicalRecordNumber: '',
    allergies: '',
    notes: ''
  });
  
  const { userProfile } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const newChild: Omit<Child, 'id' | 'createdAt' | 'updatedAt'> = {
        name: formData.name,
        dateOfBirth: new Date(formData.dateOfBirth),
        gender: formData.gender,
        parentId: userProfile?.id || '',
        parentName: userProfile?.displayName || '',
        parentContact: formData.parentContact,
        medicalRecordNumber: formData.medicalRecordNumber || undefined,
        allergies: formData.allergies ? formData.allergies.split(',').map(a => a.trim()) : undefined,
        notes: formData.notes || undefined,
      };

      // In a real app, this would save to Firestore
      onChildAdded(newChild);
      
      toast({
        title: "Child added successfully!",
        description: `${formData.name} has been added to your family profile.`,
      });
      
      setOpen(false);
      setFormData({
        name: '',
        dateOfBirth: '',
        gender: 'male',
        parentContact: '',
        medicalRecordNumber: '',
        allergies: '',
        notes: ''
      });
    } catch (error) {
      toast({
        title: "Error adding child",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="medical" className="shadow-medical">
          <Plus className="h-4 w-4 mr-2" />
          Add Child
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Baby className="h-5 w-5 text-primary" />
            <span>Add New Child</span>
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="Enter child's full name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Date of Birth</Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <Select value={formData.gender} onValueChange={(value: 'male' | 'female' | 'other') => 
              setFormData({ ...formData, gender: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="parentContact">Contact Number</Label>
            <Input
              id="parentContact"
              placeholder="Enter parent's contact number"
              value={formData.parentContact}
              onChange={(e) => setFormData({ ...formData, parentContact: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="medicalRecordNumber">Medical Record Number (Optional)</Label>
            <Input
              id="medicalRecordNumber"
              placeholder="Enter medical record number"
              value={formData.medicalRecordNumber}
              onChange={(e) => setFormData({ ...formData, medicalRecordNumber: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="allergies">Known Allergies (Optional)</Label>
            <Input
              id="allergies"
              placeholder="Enter allergies separated by commas"
              value={formData.allergies}
              onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any additional information about the child"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="medical" 
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Adding...' : 'Add Child'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};