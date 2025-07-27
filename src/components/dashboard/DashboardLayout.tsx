import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LogOut,
  Baby,
  Calendar,
  Users,
  FileText,
  BookOpen,
  Home,
  UserCircle,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { UserProfileModal } from "@/components/profile/UserProfileModal";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
}) => {
  const { userProfile, signOut } = useAuth();
  const location = useLocation();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const navigationItems = [
    { icon: Home, label: "Dashboard", path: "/dashboard" },
    {
      icon: Users,
      label:
        userProfile?.role === "healthcare_worker" ? "All Patients" : "Children",
      path: "/children",
    },
    { icon: Calendar, label: "Vaccinations", path: "/vaccinations" },
    { icon: FileText, label: "Records", path: "/records" },
    { icon: BookOpen, label: "Education", path: "/education" },
    { icon: UserCircle, label: "Profile", path: "/profile" },
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-white shadow-soft border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-foreground">
                KidCare Chronicle
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <div 
                className="flex items-center space-x-2 cursor-pointer hover:bg-muted/50 rounded-lg p-2 transition-colors"
                onClick={() => setIsProfileModalOpen(true)}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={userProfile?.photoURL} alt={userProfile?.displayName} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {userProfile?.displayName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-foreground">
                    {userProfile?.displayName}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {userProfile?.role.replace("_", " ")}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-soft border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {navigationItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 py-4 text-sm font-medium transition-colors whitespace-nowrap
        ${isActive ? "text-primary font-semibold border-b-2 border-primary" : "text-muted-foreground border-b-2 border-transparent"}
        hover:text-primary hover:border-primary`}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* User Profile Modal */}
      <UserProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
      />
    </div>
  );
};