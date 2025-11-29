import React, { KeyboardEvent, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Paperclip, X, Mic, StopCircle, Eye, EyeOff } from 'lucide-react';
import { useVoiceRecording } from '@/hooks/useVoiceRecording';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  isDisabled: boolean;
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onClearFile: () => void;
  onVoiceRecordingComplete?: (file: File) => void;
  isOneTimeView?: boolean;
  onOneTimeViewToggle?: (enabled: boolean) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSend,
  isDisabled,
  onFileSelect,
  selectedFile,
  onClearFile,
  onVoiceRecordingComplete,
  isOneTimeView = false,
  onOneTimeViewToggle,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isRecording, recordingTime, startRecording, stopRecording, cancelRecording } = useVoiceRecording();

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

  const handleVoiceRecord = async () => {
    if (isRecording) {
      const recording = await stopRecording();
      if (recording && onVoiceRecordingComplete) {
        // Convert blob to file
        const file = new File([recording.blob], `voice-${Date.now()}.webm`, {
          type: 'audio/webm;codecs=opus',
        });
        onVoiceRecordingComplete(file);
      }
    } else {
      startRecording();
    }
  };

  const formatRecordingTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const isImage = selectedFile && selectedFile.type.startsWith('image/');
  const isVideo = selectedFile && selectedFile.type.startsWith('video/');
  const previewUrl = selectedFile ? URL.createObjectURL(selectedFile) : null;

  return (
    <div className="p-4 border-t">
      {isRecording && (
        <div className="mb-2 p-3 bg-destructive/10 rounded-lg flex items-center gap-3">
          <div className="flex-1 flex items-center gap-2">
            <div className="h-3 w-3 bg-destructive rounded-full animate-pulse" />
            <span className="text-sm font-medium">Recording: {formatRecordingTime(recordingTime)}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={cancelRecording}
          >
            Cancel
          </Button>
        </div>
      )}
      
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
            {isImage && onOneTimeViewToggle && (
              <Button
                variant={isOneTimeView ? "default" : "ghost"}
                size="sm"
                onClick={() => onOneTimeViewToggle(!isOneTimeView)}
                className="h-6 px-2 gap-1"
                title={isOneTimeView ? "View once enabled" : "Click to enable view once"}
              >
                {isOneTimeView ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                <span className="text-xs">{isOneTimeView ? "1x" : ""}</span>
              </Button>
            )}
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
          disabled={isDisabled || isRecording}
          className="shrink-0"
        >
          <Paperclip className="h-4 w-4" />
        </Button>
        
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder={isRecording ? "Recording..." : "Type a message..."}
          className="min-h-[20px] max-h-[120px] resize-none"
          disabled={isDisabled || isRecording}
        />
        
        {!value.trim() && !selectedFile ? (
          <Button
            size="icon"
            onClick={handleVoiceRecord}
            disabled={isDisabled}
            className={cn(isRecording && "bg-destructive hover:bg-destructive/90")}
          >
            {isRecording ? <StopCircle className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            <span className="sr-only">{isRecording ? 'Stop recording' : 'Record voice message'}</span>
          </Button>
        ) : (
          <Button
            size="icon"
            onClick={onSend}
            disabled={(!value.trim() && !selectedFile) || isDisabled}
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
        )}
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        {isRecording ? 'Click stop to send voice message' : 'Press Enter to send, Shift + Enter for new line'}
      </p>
    </div>
  );
};
