import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignupForm } from "@/components/auth/SignupForm";
import { useState } from "react";

const Auth = () => {
  const { currentUser } = useAuth();
  const [isLogin, setIsLogin] = useState(true); // Toggle between login/signup

  if (currentUser) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <AuthLayout
      title={isLogin ? "Login to KidCare Chronicle" : "Create Your Account"}
      description={
        isLogin
          ? "Enter your email and password to access your child’s health records."
          : "Sign up to begin tracking immunizations and health info."
      }
    >
      {isLogin ? (
        <LoginForm onSwitch={() => setIsLogin(false)} />
      ) : (
        <SignupForm onSwitch={() => setIsLogin(true)} />
      )}
    </AuthLayout>
  );
};

export default Auth;
