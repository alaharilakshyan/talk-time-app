import React from 'react';
import { MessageCircle } from 'lucide-react';

export const EmptyChat = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4 sm:p-8">
      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 flex items-center justify-center mb-4 sm:mb-6 animate-pulse">
        <MessageCircle className="h-10 w-10 sm:h-12 sm:w-12 text-primary" />
      </div>
      <h3 className="text-xl sm:text-2xl font-semibold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent text-center">
        Welcome to TalkTime
      </h3>
      <p className="text-center max-w-md text-sm sm:text-base px-4">
        Select a conversation from the list to start chatting
      </p>
    </div>
  );
};
