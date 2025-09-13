import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { generateOTP, storeOTP, sendOTP, verifyOTP } from '@/services/otpService';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Eye, EyeOff, Settings } from 'lucide-react';

export const ChangePasswordDialog = () => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1); // 1: current password, 2: OTP, 3: new password
  const [formData, setFormData] = useState({
    currentPassword: '',
    otp: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [loading, setLoading] = useState(false);
  const { userProfile } = useAuth();
  const { toast } = useToast();

  const handleCurrentPasswordSubmit = async () => {
    if (!userProfile || !auth.currentUser) return;
    
    setLoading(true);
    try {
      // Reauthenticate user
      const credential = EmailAuthProvider.credential(
        userProfile.email,
        formData.currentPassword
      );
      await reauthenticateWithCredential(auth.currentUser, credential);
      
      toast({
        title: "Authentication Successful",
        description: "Password change functionality requires phone verification setup.",
        variant: "destructive",
      });
      
      setStep(2);
    } catch (error) {
      toast({
        title: "Authentication Failed",
        description: "Current password is incorrect.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSubmit = async () => {
    if (!userProfile || !auth.currentUser) return;
    
    setLoading(true);
    try {
      const result = await verifyOTP(auth.currentUser.uid, formData.otp);
      
      if (result.success) {
        setStep(3);
        toast({
          title: "OTP Verified",
          description: "You can now set your new password.",
        });
      } else {
        toast({
          title: "Invalid OTP",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    if (formData.newPassword.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters.",
        variant: "destructive",
      });
      return;
    }

    if (!auth.currentUser) return;
    
    setLoading(true);
    try {
      await updatePassword(auth.currentUser, formData.newPassword);
      
      toast({
        title: "Password Updated",
        description: "Your password has been changed successfully.",
      });
      
      // Reset form and close dialog
      setFormData({
        currentPassword: '',
        otp: '',
        newPassword: '',
        confirmPassword: '',
      });
      setStep(1);
      setOpen(false);
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      currentPassword: '',
      otp: '',
      newPassword: '',
      confirmPassword: '',
    });
    setStep(1);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="h-4 w-4" />
          Change Password
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showPasswords.current ? "text" : "password"}
                    placeholder="Enter current password"
                    value={formData.currentPassword}
                    onChange={(e) =>
                      setFormData({ ...formData, currentPassword: e.target.value })
                    }
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() =>
                      setShowPasswords({ ...showPasswords, current: !showPasswords.current })
                    }
                  >
                    {showPasswords.current ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <Button 
                onClick={handleCurrentPasswordSubmit} 
                disabled={loading || !formData.currentPassword}
                className="w-full"
              >
                {loading ? "Verifying..." : "Continue"}
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={formData.otp}
                  onChange={(e) =>
                    setFormData({ ...formData, otp: e.target.value })
                  }
                  maxLength={6}
                />
                <p className="text-sm text-muted-foreground">
                  Code sent to {userProfile?.phoneNumber}
                </p>
              </div>
              <Button 
                onClick={handleOTPSubmit} 
                disabled={loading || formData.otp.length !== 6}
                className="w-full"
              >
                {loading ? "Verifying..." : "Verify Code"}
              </Button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPasswords.new ? "text" : "password"}
                    placeholder="Enter new password"
                    value={formData.newPassword}
                    onChange={(e) =>
                      setFormData({ ...formData, newPassword: e.target.value })
                    }
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() =>
                      setShowPasswords({ ...showPasswords, new: !showPasswords.new })
                    }
                  >
                    {showPasswords.new ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPasswords.confirm ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({ ...formData, confirmPassword: e.target.value })
                    }
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() =>
                      setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })
                    }
                  >
                    {showPasswords.confirm ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              <Button 
                onClick={handlePasswordChange} 
                disabled={loading || !formData.newPassword || !formData.confirmPassword}
                className="w-full"
              >
                {loading ? "Updating..." : "Update Password"}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};