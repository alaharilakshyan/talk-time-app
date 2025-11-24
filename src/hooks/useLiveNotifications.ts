import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UseLiveNotificationsProps {
  userId: string;
  currentChatUserId: string | null;
  onNewMessage?: (message: any) => void;
}

export const useLiveNotifications = ({
  userId,
  currentChatUserId,
  onNewMessage,
}: UseLiveNotificationsProps) => {
  const { toast } = useToast();

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('message-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${userId}`,
        },
        async (payload: any) => {
          const newMessage = payload.new;

          // Don't show notification if user is currently chatting with the sender
          if (newMessage.sender_id === currentChatUserId) {
            onNewMessage?.(newMessage);
            return;
          }

          // Fetch sender info for notification
          const { data: senderData } = await supabase
            .from('profiles')
            .select('username, avatar_url')
            .eq('id', newMessage.sender_id)
            .single();

          if (senderData) {
            // Show browser notification if permission granted
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification(`New message from ${senderData.username}`, {
                body: newMessage.content.substring(0, 100),
                icon: senderData.avatar_url || '/chatbuzz-logo.png',
                tag: `message-${newMessage.id}`,
              });
            }

            // Show toast notification
            toast({
              title: `💬 ${senderData.username}`,
              description: newMessage.content.substring(0, 100),
              duration: 5000,
            });

            // Play notification sound
            const audio = new Audio('/notification.mp3');
            audio.volume = 0.5;
            audio.play().catch(() => {
              // Ignore errors if audio can't play
            });
          }

          onNewMessage?.(newMessage);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, currentChatUserId, toast, onNewMessage]);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);
};
