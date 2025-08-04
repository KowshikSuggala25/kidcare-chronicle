import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, User, Mail, Calendar, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { userProfile } = useAuth();

  if (!userProfile) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 bg-background/95 backdrop-blur-lg border border-border/50 shadow-2xl rounded-xl overflow-hidden">
        {/* Header with close button */}
        <div className="relative bg-gradient-primary p-6 text-white">
          
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="h-20 w-20 border-4 border-white/20">
              <AvatarImage src={userProfile.photoURL || undefined} />
              <AvatarFallback className="text-2xl bg-white/20 text-white">
                {userProfile.displayName?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            
            <div className="text-center">
              <h2 className="text-xl font-bold">{userProfile.displayName}</h2>
              <Badge 
                variant="secondary" 
                className="mt-2 bg-white/20 text-white border-white/30 capitalize"
              >
                {userProfile.role.replace("_", " ")}
              </Badge>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Full Name</p>
                <p className="text-sm text-muted-foreground">
                  {userProfile.displayName || "Not set"}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Mail className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Email</p>
                <p className="text-sm text-muted-foreground">{userProfile.email}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Shield className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Role</p>
                <p className="text-sm text-muted-foreground capitalize">
                  {userProfile.role.replace("_", " ")}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Member Since</p>
                <p className="text-sm text-muted-foreground">
                  {userProfile.createdAt 
                    ? new Date(
                        userProfile.createdAt?.seconds 
                          ? userProfile.createdAt.seconds * 1000 
                          : userProfile.createdAt
                      ).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    : 'Unknown'
                  }
                </p>
              </div>
            </div>

            {userProfile.updatedAt && (
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Last Updated</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(
                      userProfile.updatedAt?.seconds 
                        ? userProfile.updatedAt.seconds * 1000 
                        : userProfile.updatedAt
                    ).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-border/50">
            <p className="text-xs text-muted-foreground text-center">
              This information is read-only. To make changes, visit the Profile settings page.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};