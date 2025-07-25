import React, { useState } from 'react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignupForm } from '@/components/auth/SignupForm';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <AuthLayout
      title={isLogin ? 'Welcome Back' : 'Create Account'}
      description={isLogin ? 'Sign in to access your child\'s vaccination records' : 'Join KidCare Chronicle to start tracking your child\'s health journey'}
    >
      {isLogin ? (
        <LoginForm onToggleMode={() => setIsLogin(false)} />
      ) : (
        <SignupForm onToggleMode={() => setIsLogin(true)} />
      )}
    </AuthLayout>
  );
};

export default Auth;