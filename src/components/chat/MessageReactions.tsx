import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { SmilePlus } from 'lucide-react';

interface Reaction {
  id: string;
  emoji: string;
  user_id: string;
  count?: number;
}

interface MessageReactionsProps {
  messageId: string;
  currentUserId: string;
}

const QUICK_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

export const MessageReactions: React.FC<MessageReactionsProps> = ({ messageId, currentUserId }) => {
  const { toast } = useToast();
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReactions();

    // Subscribe to reaction changes
    const channel = supabase
      .channel(`reactions-${messageId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reactions',
          filter: `message_id=eq.${messageId}`,
        },
        () => {
          fetchReactions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [messageId]);

  const fetchReactions = async () => {
    const { data, error } = await supabase
      .from('reactions')
      .select('*')
      .eq('message_id', messageId);

    if (error) {
      console.error('Error fetching reactions:', error);
      return;
    }

    // Group reactions by emoji
    const grouped = data.reduce((acc: any, reaction: any) => {
      if (!acc[reaction.emoji]) {
        acc[reaction.emoji] = {
          id: reaction.id,
          emoji: reaction.emoji,
          user_id: reaction.user_id,
          users: [],
        };
      }
      acc[reaction.emoji].users.push(reaction.user_id);
      return acc;
    }, {});

    const reactionsList = Object.values(grouped).map((r: any) => ({
      ...r,
      count: r.users.length,
      hasReacted: r.users.includes(currentUserId),
    }));

    setReactions(reactionsList);
  };

  const handleReaction = async (emoji: string) => {
    if (loading) return;
    setLoading(true);

    try {
      // Check if user already reacted with this emoji
      const existingReaction = reactions.find(
        (r) => r.emoji === emoji && (r as any).hasReacted
      );

      if (existingReaction) {
        // Remove reaction
        const { error } = await supabase
          .from('reactions')
          .delete()
          .eq('message_id', messageId)
          .eq('user_id', currentUserId)
          .eq('emoji', emoji);

        if (error) throw error;
      } else {
        // Add reaction
        const { error } = await supabase
          .from('reactions')
          .insert({
            message_id: messageId,
            user_id: currentUserId,
            emoji,
          });

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error updating reaction:', error);
      toast({
        title: 'Error',
        description: 'Failed to update reaction',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-1 flex-wrap mt-1">
      {reactions.map((reaction: any) => (
        <Button
          key={reaction.id}
          variant={reaction.hasReacted ? 'default' : 'secondary'}
          size="sm"
          className="h-6 px-2 text-xs rounded-full"
          onClick={() => handleReaction(reaction.emoji)}
        >
          <span>{reaction.emoji}</span>
          {reaction.count > 1 && <span className="ml-1">{reaction.count}</span>}
        </Button>
      ))}

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 rounded-full">
            <SmilePlus className="h-3 w-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="start">
          <div className="flex gap-1">
            {QUICK_EMOJIS.map((emoji) => (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-lg hover:scale-125 transition-transform"
                onClick={() => handleReaction(emoji)}
              >
                {emoji}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
