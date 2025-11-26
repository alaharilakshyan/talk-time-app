-- Drop the problematic policies
DROP POLICY IF EXISTS "Users can view group members of their groups" ON public.group_members;
DROP POLICY IF EXISTS "Users can view their messages and group messages" ON public.messages;

-- Create a security definer function to check group membership
CREATE OR REPLACE FUNCTION public.is_group_member(_user_id uuid, _group_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.group_members
    WHERE user_id = _user_id
      AND group_id = _group_id
  )
$$;

-- Recreate group_members SELECT policy using the function
CREATE POLICY "Users can view group members of their groups"
  ON public.group_members FOR SELECT
  USING (public.is_group_member(auth.uid(), group_id));

-- Recreate messages SELECT policy using the function
CREATE POLICY "Users can view their messages and group messages"
  ON public.messages FOR SELECT
  USING (
    auth.uid() = sender_id 
    OR auth.uid() = receiver_id
    OR (group_id IS NOT NULL AND public.is_group_member(auth.uid(), group_id))
  );