
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';

interface ChatInputProps {
  selectedUserId: string | null;
  newMessage: string;
  setNewMessage: (message: string) => void;
  isConnected: boolean;
  isSending: boolean;
  onSendMessage: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  selectedUserId,
  newMessage,
  setNewMessage,
  isConnected,
  isSending,
  onSendMessage
}) => {
  if (!selectedUserId) return null;

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSendMessage();
    }
  };

  return (
    <div className="p-4 border-t border-orange-200 dark:border-orange-800 bg-white dark:bg-gray-900">
      <div className="flex items-center space-x-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={isConnected ? "Type a message..." : "Disconnected - cannot send messages"}
          className="flex-1"
          disabled={!isConnected || isSending}
          onKeyPress={handleKeyPress}
        />
        <Button 
          onClick={onSendMessage}
          disabled={!isConnected || isSending || !newMessage.trim()}
          className="bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
