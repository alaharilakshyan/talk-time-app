-- Create reactions table for message reactions
CREATE TABLE IF NOT EXISTS public.reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(message_id, user_id, emoji)
);

-- Enable RLS
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;

-- Users can view reactions on messages they can see
CREATE POLICY "Users can view reactions on their messages"
  ON public.reactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.messages
      WHERE messages.id = reactions.message_id
      AND (messages.sender_id = auth.uid() OR messages.receiver_id = auth.uid())
    )
  );

-- Users can add reactions
CREATE POLICY "Users can add reactions"
  ON public.reactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own reactions
CREATE POLICY "Users can delete their own reactions"
  ON public.reactions FOR DELETE
  USING (auth.uid() = user_id);

-- Add index for better performance
CREATE INDEX idx_reactions_message_id ON public.reactions(message_id);

-- Enable realtime for reactions
ALTER PUBLICATION supabase_realtime ADD TABLE public.reactions;