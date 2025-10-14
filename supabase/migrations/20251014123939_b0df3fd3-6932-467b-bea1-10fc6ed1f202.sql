-- Fix security warnings by setting search_path for functions

-- Update generate_user_tag function
CREATE OR REPLACE FUNCTION generate_user_tag()
RETURNS TEXT 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_tag TEXT;
  tag_exists BOOLEAN;
BEGIN
  LOOP
    new_tag := LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE user_tag = new_tag) INTO tag_exists;
    EXIT WHEN NOT tag_exists;
  END LOOP;
  RETURN new_tag;
END;
$$;

-- Update handle_updated_at function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;