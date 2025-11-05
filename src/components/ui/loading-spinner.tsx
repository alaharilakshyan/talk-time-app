import React from 'react';
import { MessageCircle } from 'lucide-react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        </div>
        <div className="w-20 h-20 flex items-center justify-center">
          <MessageCircle className="w-10 h-10 text-primary animate-pulse" />
        </div>
      </div>
    </div>
  );
};
