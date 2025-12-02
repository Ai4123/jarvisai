-- Update survey_responses.user_id foreign key to reference public.users instead of auth.users
-- This aligns with the JWT token which contains user_id from public.users

-- Step 1: Drop the old foreign key constraint
ALTER TABLE public.survey_responses
DROP CONSTRAINT IF EXISTS survey_responses_user_id_fkey;

-- Step 2: Add new foreign key constraint referencing public.users
ALTER TABLE public.survey_responses
ADD CONSTRAINT survey_responses_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES public.users(id)
ON DELETE CASCADE
ON UPDATE NO ACTION;

-- Note: This assumes that the user_id in the JWT token matches the id in public.users table

