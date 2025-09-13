import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Child } from "@/types";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Edit3, Loader2, Save } from "lucide-react";

interface EditChildDialogProps {
  child: Child;
  onChildUpdated: (updatedChild: Child) => void;
}

export const EditChildDialog: React.FC<EditChildDialogProps> = ({
  child,
  onChildUpdated,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: child.name,
    dateOfBirth: child.dateOfBirth.toISOString().split('T')[0],
    gender: child.gender,
    parentName: child.parentName,
    parentContact: child.parentContact,
    medicalRecordNumber: child.medicalRecordNumber || "",
    allergies: child.allergies ? child.allergies.join(", ") : "",
    notes: child.notes || "",
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: child.name,
        dateOfBirth: child.dateOfBirth.toISOString().split('T')[0],
        gender: child.gender,
        parentName: child.parentName,
        parentContact: child.parentContact,
        medicalRecordNumber: child.medicalRecordNumber || "",
        allergies: child.allergies ? child.allergies.join(", ") : "",
        notes: child.notes || "",
      });
    }
  }, [child, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const updatedData = {
        name: formData.name,
        dateOfBirth: new Date(formData.dateOfBirth),
        gender: formData.gender,
        parentName: formData.parentName,
        parentContact: formData.parentContact,
        medicalRecordNumber: formData.medicalRecordNumber || null,
        allergies: formData.allergies ? formData.allergies.split(",").map(a => a.trim()).filter(a => a) : [],
        notes: formData.notes || null,
        updatedAt: new Date(),
      };

      await updateDoc(doc(db, "children", child.id), updatedData);

      const updatedChild: Child = {
        ...child,
        ...updatedData,
      };

      onChildUpdated(updatedChild);
      setIsOpen(false);

      toast({
        title: "Success",
        description: "Child information updated successfully!",
      });
    } catch (error) {
      console.error("Error updating child:", error);
      toast({
        title: "Error",
        description: "Failed to update child information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Edit3 className="h-4 w-4 mr-2" />
          {t('common.edit')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Child Information</DialogTitle>
          <DialogDescription>
            Update the child's personal and medical information.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth *</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender *</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => setFormData({ ...formData, gender: value as "male" | "female" | "other" })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="medicalRecordNumber">Medical Record Number</Label>
              <Input
                id="medicalRecordNumber"
                value={formData.medicalRecordNumber}
                onChange={(e) => setFormData({ ...formData, medicalRecordNumber: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="parentName">Parent/Guardian Name *</Label>
              <Input
                id="parentName"
                value={formData.parentName}
                onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="parentContact">Parent/Guardian Contact *</Label>
              <Input
                id="parentContact"
                type="tel"
                value={formData.parentContact}
                onChange={(e) => setFormData({ ...formData, parentContact: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="allergies">Allergies (comma separated)</Label>
            <Input
              id="allergies"
              value={formData.allergies}
              onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
              placeholder="e.g., Penicillin, Peanuts, Dairy"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional medical or personal notes..."
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};