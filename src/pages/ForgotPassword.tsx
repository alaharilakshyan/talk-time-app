import React from 'react';
import { ForgotPassword as ForgotPasswordForm } from '@/components/auth/ForgotPassword';
import { ThemeToggle } from '@/components/ui/theme-toggle';

const ForgotPassword = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-rose-50 dark:from-gray-900 dark:to-gray-800 flex flex-col">
      <div className="flex justify-end p-4">
        <ThemeToggle />
      </div>
      
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md space-y-8">
          {/* Logo/Brand */}
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-rose-400 rounded-2xl flex items-center justify-center mx-auto">
              <span className="text-white font-bold text-2xl">C</span>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent">
              ChatApp
            </h1>
            <p className="text-muted-foreground">Reset your password</p>
          </div>

          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
