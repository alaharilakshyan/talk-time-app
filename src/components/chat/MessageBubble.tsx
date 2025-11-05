import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FileText, Download, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  file_url: string | null;
  file_name: string | null;
  is_deleted: boolean;
  created_at: string;
  isSent?: boolean;
  sender?: {
    username: string;
    avatar_url: string | null;
  };
}

interface MessageBubbleProps {
  message: Message;
  isSent: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isSent }) => {
  const senderName = isSent ? 'You' : (message.sender?.username || 'Unknown');
  const avatarUrl = message.sender?.avatar_url;
  const isImage = message.file_url && /\.(jpg|jpeg|png|gif|webp)$/i.test(message.file_url);
  const isVideo = message.file_url && /\.(mp4|webm|ogg)$/i.test(message.file_url);

  if (message.is_deleted) {
    return (
      <div className={`flex gap-2 md:gap-3 mb-3 md:mb-4 ${isSent ? 'justify-end' : 'justify-start'}`}>
        <div className="italic text-muted-foreground text-sm">Message deleted</div>
      </div>
    );
  }

  return (
    <div className={`flex gap-2 mb-2 animate-fade-in ${isSent ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex flex-col max-w-[85%] sm:max-w-[75%] ${isSent ? 'items-end' : 'items-start'}`}>
        <div className={`rounded-lg px-3 py-2 shadow-sm relative ${
          isSent 
            ? 'bg-[hsl(var(--chart-2))] text-white' 
            : 'bg-card'
        }`}>
          {message.file_url && (
            <div className="mb-2">
              {isImage ? (
                <div className="space-y-2">
                  <img
                    src={message.file_url}
                    alt={message.file_name || 'Image'}
                    className="max-w-full rounded-lg max-h-64 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => window.open(message.file_url!, '_blank')}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="flex-1 h-7 text-xs"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = message.file_url!;
                        link.download = message.file_name || 'image';
                        link.click();
                      }}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="flex-1 h-7 text-xs"
                      onClick={() => window.open(message.file_url!, '_blank')}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Open
                    </Button>
                  </div>
                </div>
              ) : isVideo ? (
                <div className="space-y-2">
                  <video
                    src={message.file_url}
                    controls
                    className="max-w-full rounded-lg max-h-64"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="flex-1 h-7 text-xs"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = message.file_url!;
                        link.download = message.file_name || 'video';
                        link.click();
                      }}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="flex-1 h-7 text-xs"
                      onClick={() => window.open(message.file_url!, '_blank')}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Open
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <a
                    href={message.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 bg-background/10 rounded-lg hover:bg-background/20 transition-colors"
                  >
                    <FileText className="h-5 w-5" />
                    <span className="text-sm truncate">{message.file_name}</span>
                  </a>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="flex-1 h-7 text-xs"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = message.file_url!;
                        link.download = message.file_name || 'file';
                        link.click();
                      }}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="flex-1 h-7 text-xs"
                      onClick={() => window.open(message.file_url!, '_blank')}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Open
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
          {message.content && message.content !== 'Sent a file' && (
            <p className="text-sm break-words whitespace-pre-wrap leading-relaxed">
              {message.content}
            </p>
          )}
          <span className={`text-[10px] mt-1 block ${
            isSent ? 'text-white/70' : 'text-muted-foreground'
          }`}>
            {new Date(message.created_at).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>
      </div>
    </div>
  );
};
