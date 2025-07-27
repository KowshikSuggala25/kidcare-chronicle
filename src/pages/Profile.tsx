import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { generateUniqueQR } from "@/services/qrService";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Edit, Camera, Shield, User } from "lucide-react";
import { doc, updateDoc } from "firebase/firestore";
import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { db } from "@/lib/firebase";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

export const Profile: React.FC = () => {
  const { currentUser, userProfile } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [qrCodeImage, setQrCodeImage] = useState<string | null>(null);
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [profileData, setProfileData] = useState({
    displayName: userProfile?.displayName || "",
    email: userProfile?.email || "",
    role: userProfile?.role || "parent",
  });
  const [profileImage, setProfileImage] = useState<string>(
    userProfile?.photoURL || ""
  );
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  const handleEditToggle = () => {
    if (isEditing) {
      setProfileData({
        displayName: userProfile?.displayName || "",
        email: userProfile?.email || "",
        role: userProfile?.role || "parent",
      });
      setProfileImage(userProfile?.photoURL || "");
    }
    setIsEditing(!isEditing);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  const handleGenerateQR = async () => {
    if (!userProfile) return;

    setIsGeneratingQR(true);
    try {
      const childData = {
        id: userProfile.id,
        name: userProfile.displayName,
        dateOfBirth: new Date(),
        gender: "other" as const,
        parentId: userProfile.id,
        parentName: userProfile.displayName,
        parentContact: userProfile.email,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const qrDataUrl = await generateUniqueQR(childData);
      setQrCodeImage(qrDataUrl);

      toast({
        title: "QR Code Generated",
        description: "Your QR code has been generated successfully.",
      });
    } catch (error) {
      console.error("Error generating QR code:", error);
      toast({
        title: "Error",
        description: "Failed to generate QR code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingQR(false);
    }
  };
  const handleSaveProfile = async () => {
    if (!currentUser || !userProfile) return;

    setLoading(true);
    try {
      const updateData = {
        ...profileData,
        photoURL: profileImage,
        updatedAt: new Date(),
      };

      await updateDoc(doc(db, "users", currentUser.uid), updateData);

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });

      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentUser) return;

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Re-authenticate user with current password
      const credential = EmailAuthProvider.credential(
        currentUser.email!,
        passwordData.currentPassword
      );
      await reauthenticateWithCredential(currentUser, credential);

      // Update password
      await updatePassword(currentUser, passwordData.newPassword);

      // Update password changed timestamp in Firestore
      await updateDoc(doc(db, "users", currentUser.uid), {
        passwordChangedAt: new Date(),
        updatedAt: new Date(),
      });

      toast({
        title: "Password Changed",
        description: "Your password has been successfully updated.",
      });

      setIsChangingPassword(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      console.error("Error changing password:", error);

      let errorMessage = "Failed to change password. Please try again.";
      if (error.code === "auth/wrong-password") {
        errorMessage = "Current password is incorrect.";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "New password is too weak.";
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!userProfile) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading profile...</div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Profile</h1>
            <p className="text-muted-foreground">
              Manage your account settings and preferences
            </p>
          </div>
          <Badge variant="outline" className="capitalize">
            {userProfile.role}
          </Badge>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Profile Image Card */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Profile Picture</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              <Avatar className="h-32 w-32">
                <AvatarImage src={profileImage} alt={profileData.displayName} />
                <AvatarFallback className="text-2xl">
                  {profileData.displayName.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>

              {isEditing && (
                <div className="w-full">
                  <Label htmlFor="photo-upload" className="cursor-pointer">
                    <Button variant="outline" className="w-full" asChild>
                      <span>
                        <Camera className="h-4 w-4 mr-2" />
                        Upload Photo
                      </span>
                    </Button>
                  </Label>
                  <Input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              )}
              {qrCodeImage && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Your QR Code</p>
                  <div className="mx-auto w-32 h-32 border rounded-lg overflow-hidden">
                    <img
                      src={qrCodeImage}
                      alt="QR Code"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              )}

              <Button
                onClick={handleGenerateQR}
                disabled={isGeneratingQR}
                variant="outline"
                size="sm"
                className="w-full"
              >
                {isGeneratingQR ? "Generating..." : "Generate QR Code"}
              </Button>
            </CardContent>
          </Card>

          {/* Profile Details Card */}
          <Card className="md:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Profile Information</CardTitle>
                <Button
                  variant={isEditing ? "destructive" : "outline"}
                  onClick={handleEditToggle}
                  disabled={loading}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  {isEditing ? "Cancel" : "Edit Profile"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    value={profileData.displayName}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        displayName: e.target.value,
                      })
                    }
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input
                  id="role"
                  value={profileData.role}
                  disabled
                  className="bg-muted capitalize"
                />
              </div>

              <div className="text-sm text-muted-foreground">
                <p>
                  Account created:{" "}
                  {userProfile.createdAt
                    ? new Date(
                        userProfile.createdAt?.seconds
                          ? userProfile.createdAt.seconds * 1000
                          : userProfile.createdAt
                      ).toLocaleDateString()
                    : "Unknown"}
                </p>
                <p>
                  Last updated:{" "}
                  {userProfile.updatedAt
                    ? new Date(
                        userProfile.updatedAt?.seconds
                          ? userProfile.updatedAt.seconds * 1000
                          : userProfile.updatedAt
                      ).toLocaleDateString()
                    : "Unknown"}
                </p>
              </div>

              {isEditing && (
                <div className="flex space-x-2 pt-4">
                  <Button onClick={handleSaveProfile} disabled={loading}>
                    Save Changes
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Security Card */}
          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Security Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Password</h3>
                  <p className="text-sm text-muted-foreground">
                    Last changed:{" "}
                    {userProfile.passwordChangedAt
                      ? new Date(
                          userProfile.passwordChangedAt?.seconds
                            ? userProfile.passwordChangedAt.seconds * 1000
                            : userProfile.passwordChangedAt
                        ).toLocaleDateString()
                      : "Not available"}
                  </p>
                </div>

                <Dialog
                  open={isChangingPassword}
                  onOpenChange={setIsChangingPassword}
                >
                  <DialogTrigger asChild>
                    <Button variant="outline">Change Password</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Change Password</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">
                          Current Password
                        </Label>
                        <Input
                          id="currentPassword"
                          type="password"
                          value={passwordData.currentPassword}
                          onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              currentPassword: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              newPassword: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">
                          Confirm New Password
                        </Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              confirmPassword: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="flex space-x-2 pt-4">
                        <Button
                          onClick={handleChangePassword}
                          disabled={loading}
                        >
                          Update Password
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setIsChangingPassword(false)}
                          disabled={loading}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};
