import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface OTPVerification {
  phoneNumber: string;
  otp: string;
  expiresAt: Date;
  verified: boolean;
  createdAt: Date;
}

// Generate a 6-digit OTP
export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Store OTP in Firebase
export const storeOTP = async (userId: string, phoneNumber: string, otp: string): Promise<void> => {
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 10); // 10 minutes expiry

  const otpData: OTPVerification = {
    phoneNumber,
    otp,
    expiresAt,
    verified: false,
    createdAt: new Date(),
  };

  await setDoc(doc(db, 'otp_verifications', userId), otpData);
};

// Verify OTP
export const verifyOTP = async (userId: string, enteredOTP: string): Promise<{ success: boolean; message: string }> => {
  try {
    const otpDoc = await getDoc(doc(db, 'otp_verifications', userId));
    
    if (!otpDoc.exists()) {
      return { success: false, message: 'No OTP found. Please request a new one.' };
    }

    const otpData = otpDoc.data() as OTPVerification;
    
    // Handle Firebase Timestamp conversion
    const expiresAt = otpData.expiresAt instanceof Date ? otpData.expiresAt : new Date((otpData.expiresAt as any).seconds * 1000);
    
    if (new Date() > expiresAt) {
      return { success: false, message: 'OTP has expired. Please request a new one.' };
    }

    if (otpData.verified) {
      return { success: false, message: 'OTP has already been used.' };
    }

    if (otpData.otp !== enteredOTP) {
      return { success: false, message: 'Invalid OTP. Please try again.' };
    }

    // Mark as verified
    await updateDoc(doc(db, 'otp_verifications', userId), {
      verified: true,
    });

    // Update user's phone verification status
    await updateDoc(doc(db, 'users', userId), {
      phoneVerified: true,
      updatedAt: new Date(),
    });

    return { success: true, message: 'Phone number verified successfully!' };
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return { success: false, message: 'Failed to verify OTP. Please try again.' };
  }
};

// Send OTP via Twilio (client-side implementation)
export const sendOTP = async (phoneNumber: string, otp: string, twilioConfig: { accountSid: string; authToken: string; fromNumber: string }): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioConfig.accountSid}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${twilioConfig.accountSid}:${twilioConfig.authToken}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        From: twilioConfig.fromNumber,
        To: phoneNumber,
        Body: `Your verification code is: ${otp}. This code will expire in 10 minutes.`,
      }),
    });

    if (response.ok) {
      return { success: true, message: 'OTP sent successfully!' };
    } else {
      const error = await response.text();
      console.error('Twilio API error:', error);
      return { success: false, message: 'Failed to send OTP. Please check your phone number.' };
    }
  } catch (error) {
    console.error('Error sending OTP:', error);
    return { success: false, message: 'Failed to send OTP. Please try again.' };
  }
};