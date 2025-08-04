import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { generateOTP, storeOTP, sendOTP, verifyOTP } from '@/services/otpService';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, MessageSquare, Shield } from 'lucide-react';

interface OTPVerificationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  phoneNumber: string;
  onVerificationSuccess: () => void;
}

export const OTPVerificationDialog: React.FC<OTPVerificationDialogProps> = ({
  isOpen,
  onOpenChange,
  phoneNumber,
  onVerificationSuccess,
}) => {
  const [step, setStep] = useState<'send' | 'verify'>('send');
  const [otpCode, setOtpCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [twilioConfig, setTwilioConfig] = useState({
    accountSid: localStorage.getItem('twilio_account_sid') || '',
    authToken: localStorage.getItem('twilio_auth_token') || '',
    fromNumber: localStorage.getItem('twilio_from_number') || '',
  });
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const handleSendOTP = async () => {
    if (!phoneNumber || !currentUser) {
      toast({
        title: "Error",
        description: "Phone number is required.",
        variant: "destructive",
      });
      return;
    }

    if (!twilioConfig.accountSid || !twilioConfig.authToken || !twilioConfig.fromNumber) {
      toast({
        title: "Twilio Configuration Required",
        description: "Please enter your Twilio credentials below.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const otp = generateOTP();
      
      // Store OTP in Firebase
      await storeOTP(currentUser.uid, phoneNumber, otp);
      
      // Send OTP via Twilio
      const result = await sendOTP(phoneNumber, otp, twilioConfig);
      
      if (result.success) {
        // Save Twilio config to localStorage for future use
        localStorage.setItem('twilio_account_sid', twilioConfig.accountSid);
        localStorage.setItem('twilio_auth_token', twilioConfig.authToken);
        localStorage.setItem('twilio_from_number', twilioConfig.fromNumber);
        
        setStep('verify');
        toast({
          title: "OTP Sent",
          description: "Verification code sent to your phone number.",
        });
      } else {
        toast({
          title: "Failed to Send OTP",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      toast({
        title: "Error",
        description: "Failed to send OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otpCode || !currentUser) {
      toast({
        title: "Error",
        description: "Please enter the verification code.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await verifyOTP(currentUser.uid, otpCode);
      
      if (result.success) {
        toast({
          title: "Verification Successful",
          description: result.message,
        });
        onVerificationSuccess();
        onOpenChange(false);
        setStep('send');
        setOtpCode('');
      } else {
        toast({
          title: "Verification Failed",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast({
        title: "Error",
        description: "Failed to verify OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setStep('send');
    setOtpCode('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {step === 'send' ? (
              <>
                <MessageSquare className="h-5 w-5" />
                <span>Send Verification Code</span>
              </>
            ) : (
              <>
                <Shield className="h-5 w-5" />
                <span>Verify Phone Number</span>
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {step === 'send' ? (
            <>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input value={phoneNumber} disabled />
                <p className="text-xs text-muted-foreground">
                  A verification code will be sent to this number.
                </p>
              </div>

              <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                <h4 className="text-sm font-medium">Twilio Configuration</h4>
                <div className="space-y-2">
                  <Label htmlFor="accountSid">Account SID</Label>
                  <Input
                    id="accountSid"
                    type="password"
                    value={twilioConfig.accountSid}
                    onChange={(e) => setTwilioConfig({ ...twilioConfig, accountSid: e.target.value })}
                    placeholder="Enter your Twilio Account SID"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="authToken">Auth Token</Label>
                  <Input
                    id="authToken"
                    type="password"
                    value={twilioConfig.authToken}
                    onChange={(e) => setTwilioConfig({ ...twilioConfig, authToken: e.target.value })}
                    placeholder="Enter your Twilio Auth Token"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fromNumber">From Number</Label>
                  <Input
                    id="fromNumber"
                    value={twilioConfig.fromNumber}
                    onChange={(e) => setTwilioConfig({ ...twilioConfig, fromNumber: e.target.value })}
                    placeholder="+1234567890"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Your Twilio credentials will be stored locally and encrypted.
                </p>
              </div>

              <Button onClick={handleSendOTP} disabled={isLoading} className="w-full">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Verification Code
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <Input
                  id="otp"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                />
                <p className="text-xs text-muted-foreground">
                  Enter the 6-digit code sent to {phoneNumber}
                </p>
              </div>

              <div className="flex space-x-2">
                <Button variant="outline" onClick={handleBack} className="flex-1">
                  Back
                </Button>
                <Button onClick={handleVerifyOTP} disabled={isLoading} className="flex-1">
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Verify
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};