import React, { KeyboardEvent, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Paperclip, X } from 'lucide-react';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  isDisabled: boolean;
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onClearFile: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSend,
  isDisabled,
  onFileSelect,
  selectedFile,
  onClearFile,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if ((value.trim() || selectedFile) && !isDisabled) {
        onSend();
      }
    }
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const isImage = selectedFile && selectedFile.type.startsWith('image/');
  const isVideo = selectedFile && selectedFile.type.startsWith('video/');
  const previewUrl = selectedFile ? URL.createObjectURL(selectedFile) : null;

  return (
    <div className="p-4 border-t">
      {selectedFile && (
        <div className="mb-2 p-2 bg-muted rounded-lg space-y-2">
          {isImage && previewUrl && (
            <div className="relative max-w-xs">
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="rounded-lg max-h-40 object-cover"
              />
            </div>
          )}
          {isVideo && previewUrl && (
            <div className="relative max-w-xs">
              <video 
                src={previewUrl} 
                className="rounded-lg max-h-40"
                controls
              />
            </div>
          )}
          <div className="flex items-center gap-2">
            <Paperclip className="h-4 w-4" />
            <span className="text-sm flex-1 truncate">{selectedFile.name}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFile}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      <div className="flex gap-2">
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          className="hidden"
          accept="image/*,video/*,.pdf,.doc,.docx,.txt"
        />
        <Button
          variant="outline"
          size="icon"
          onClick={handleFileClick}
          disabled={isDisabled}
          className="shrink-0"
        >
          <Paperclip className="h-4 w-4" />
        </Button>
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Type a message..."
          className="min-h-[20px] max-h-[120px] resize-none"
          disabled={isDisabled}
        />
        <Button
          size="icon"
          onClick={onSend}
          disabled={(!value.trim() && !selectedFile) || isDisabled}
        >
          <Send className="h-4 w-4" />
          <span className="sr-only">Send message</span>
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        Press Enter to send, Shift + Enter for new line
      </p>
    </div>
  );
};
