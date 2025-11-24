import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FileText, Download, ExternalLink, Trash2, Volume2, Pause, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MessageReactions } from './MessageReactions';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { decryptMessage, isEncrypted } from '@/utils/encryption';

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
  currentUserId: string;
  onDelete?: (messageId: string) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isSent, currentUserId, onDelete }) => {
  const { toast } = useToast();
  const senderName = isSent ? 'You' : (message.sender?.username || 'Unknown');
  const avatarUrl = message.sender?.avatar_url;
  const isImage = message.file_url && /\.(jpg|jpeg|png|gif|webp)$/i.test(message.file_url);
  const isVideo = message.file_url && /\.(mp4|webm|ogg)$/i.test(message.file_url);
  const isAudio = message.file_url && /\.(mp3|wav|webm|ogg|m4a)$/i.test(message.file_url) && message.content === '[Voice message]';
  const [decryptedContent, setDecryptedContent] = useState<string>(message.content);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement] = useState(() => new Audio());

  useEffect(() => {
    const decrypt = async () => {
      if (message.content && isEncrypted(message.content)) {
        const decrypted = await decryptMessage(message.content, currentUserId);
        setDecryptedContent(decrypted);
      }
    };
    decrypt();
  }, [message.content, currentUserId]);

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_deleted: true })
        .eq('id', message.id);

      if (error) throw error;

      // Delete file from storage if exists
      if (message.file_url) {
        const filePath = message.file_url.split('/').slice(-2).join('/');
        await supabase.storage.from('chat-files').remove([filePath]);
      }

      onDelete?.(message.id);
      toast({
        title: 'Message deleted',
        description: 'Message has been deleted for everyone',
      });
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete message',
        variant: 'destructive',
      });
    }
  };

  const toggleAudioPlayback = () => {
    if (!message.file_url) return;

    if (isPlaying) {
      audioElement.pause();
      setIsPlaying(false);
    } else {
      audioElement.src = message.file_url;
      audioElement.play();
      setIsPlaying(true);
      
      audioElement.onended = () => {
        setIsPlaying(false);
      };
    }
  };

  if (message.is_deleted) {
    return (
      <div className={`flex gap-2 md:gap-3 mb-3 md:mb-4 ${isSent ? 'justify-end' : 'justify-start'}`}>
        <div className="italic text-muted-foreground text-sm">Message deleted</div>
      </div>
    );
  }

  return (
    <div className={`flex gap-2 mb-2 animate-fade-in group ${isSent ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex flex-col max-w-[85%] sm:max-w-[75%] ${isSent ? 'items-end' : 'items-start'}`}>
        <div className={`rounded-2xl px-3 py-2 shadow-sm relative ${
          isSent 
            ? 'bg-primary text-primary-foreground rounded-tr-none' 
            : 'bg-card rounded-tl-none'
        }`}>
          {isSent && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute -right-8 top-0 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
              onClick={handleDelete}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
          
          {isAudio && message.file_url ? (
            <div className="flex items-center gap-2 min-w-[200px]">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-full"
                onClick={toggleAudioPlayback}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <div className="flex-1 flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                <div className="flex-1 h-1 bg-background/20 rounded-full overflow-hidden">
                  <div className="h-full bg-background/40 w-1/3" />
                </div>
              </div>
            </div>
          ) : message.file_url && (
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
          {decryptedContent && decryptedContent !== 'Sent a file' && decryptedContent !== '[Voice message]' && (
            <p className="text-sm break-words whitespace-pre-wrap leading-relaxed">
              {decryptedContent}
            </p>
          )}
          <span className={`text-[10px] mt-1 block ${
            isSent ? 'opacity-70' : 'text-muted-foreground'
          }`}>
            {new Date(message.created_at).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>
        
        <MessageReactions messageId={message.id} currentUserId={currentUserId} />
      </div>
    </div>
  );
};
