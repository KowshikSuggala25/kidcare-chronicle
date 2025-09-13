import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Camera, Shield, Save, X, Edit3 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { doc, updateDoc } from "firebase/firestore";
import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { db } from "@/lib/firebase";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { generateUniqueQR } from "@/services/qrService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export const Profile: React.FC = () => {
  const { currentUser, userProfile } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [qrCodeImage, setQrCodeImage] = useState<string | null>(null);
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [editFormData, setEditFormData] = useState({
    displayName: userProfile?.displayName || "",
    photoURL: userProfile?.photoURL || "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      setEditFormData({ ...editFormData, photoURL: URL.createObjectURL(file) });
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

  const handleSaveChanges = async () => {
    if (!currentUser || !userProfile) return;

    try {
      await updateDoc(doc(db, "users", currentUser.uid), {
        displayName: editFormData.displayName,
        photoURL: editFormData.photoURL,
        updatedAt: new Date(),
      });

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
    }
  };

  const handleCancelEdit = () => {
    setEditFormData({
      displayName: userProfile?.displayName || "",
      photoURL: userProfile?.photoURL || "",
    });
    setProfileImage(null);
    setIsEditing(false);
  };

  const handleChangePassword = async () => {
    if (!currentUser) return;

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New password and confirmation password do not match.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Re-authenticate user
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
      let errorMessage = "Failed to change password.";

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
    }
  };

  if (!userProfile) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
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
                <span>Profile Image</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <Avatar className="h-24 w-24 mx-auto">
                <AvatarImage src={userProfile.photoURL || undefined} />
                <AvatarFallback className="text-2xl">
                  {userProfile.displayName?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>

              {/* QR Code Display */}
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

              {userProfile.role === "healthcare_worker" && (
                <Button
                  onClick={handleGenerateQR}
                  disabled={isGeneratingQR}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  {isGeneratingQR ? "Generating..." : "Generate QR Code"}
                </Button>
              )}

              {isEditing && (
                <div className="space-y-2">
                  <Label htmlFor="profileImage">Profile Picture</Label>
                  <Input
                    id="profileImage"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="cursor-pointer"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Personal Information Card */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Personal Information</span>
                </span>
                {!isEditing ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelEdit}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleSaveChanges}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  {isEditing ? (
                    <Input
                      id="displayName"
                      value={editFormData.displayName}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          displayName: e.target.value,
                        })
                      }
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {userProfile.displayName || "Not set"}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <p className="text-sm text-muted-foreground">
                    {userProfile.email}
                  </p>
                </div>
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
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Changes will be saved to your profile. Some changes may
                    require you to refresh the page.
                  </p>
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

                      <div className="flex justify-end space-x-2 pt-4">
                        <Button
                          variant="outline"
                          onClick={() => setIsChangingPassword(false)}
                        >
                          Cancel
                        </Button>
                        <Button onClick={handleChangePassword}>
                          Change Password
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
