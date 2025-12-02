-- Fix group_members INSERT policy to allow creator to add themselves
DROP POLICY IF EXISTS "Group creators can add members" ON public.group_members;

-- Create new policy that allows group creator to add any members
CREATE POLICY "Group creators can add members" ON public.group_members
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.groups
    WHERE groups.id = group_members.group_id
    AND groups.created_by = auth.uid()
  )
  OR
  -- Allow users to add themselves to groups they're being invited to
  user_id = auth.uid()
);