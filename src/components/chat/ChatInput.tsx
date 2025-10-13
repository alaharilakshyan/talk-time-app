import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  isDisabled: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSend,
  isDisabled
}) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="p-3 sm:p-6 border-t border-primary/10 bg-gradient-to-r from-primary/5 to-secondary/5 backdrop-blur-sm">
      <div className="flex gap-2 sm:gap-3 items-end">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          disabled={isDisabled}
          className="min-h-[44px] sm:min-h-[50px] max-h-[120px] sm:max-h-[150px] resize-none bg-background/50 backdrop-blur-sm border-primary/20 focus:border-primary/40 rounded-xl transition-all text-sm sm:text-base"
          rows={1}
        />
        <Button
          onClick={onSend}
          disabled={isDisabled || !value.trim()}
          size="icon"
          className="h-[44px] w-[44px] sm:h-[50px] sm:w-[50px] rounded-xl bg-gradient-to-r from-primary to-secondary hover:opacity-90 shadow-lg transition-all active:scale-95 sm:hover:scale-105 disabled:opacity-50"
        >
          <Send className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
      </div>
    </div>
  );
};
