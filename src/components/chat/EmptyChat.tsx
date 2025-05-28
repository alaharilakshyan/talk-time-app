
import React from 'react';
import { Card } from '@/components/ui/card';

export const EmptyChat = () => {
  return (
    <div className="flex items-center justify-center h-full">
      <Card className="p-8 text-center border-orange-200 dark:border-orange-800">
        <div className="text-gray-500 dark:text-gray-400">
          <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-4">
            💬
          </div>
          <h3 className="text-lg font-semibold mb-2">Start a conversation</h3>
          <p className="text-sm">Select a user from the floating sidebar to begin chatting</p>
        </div>
      </Card>
    </div>
  );
};
