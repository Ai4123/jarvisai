-- Make ticket_id nullable in survey_responses table
-- This allows surveys to be submitted without a ticket

-- First, check if there are any existing survey_responses with null ticket_id
-- If so, we need to handle them before making the column nullable

-- Step 1: Drop the foreign key constraint temporarily
ALTER TABLE public.survey_responses
DROP CONSTRAINT IF EXISTS survey_responses_ticket_id_fkey;

-- Step 2: Make ticket_id nullable
ALTER TABLE public.survey_responses
ALTER COLUMN ticket_id DROP NOT NULL;

-- Step 3: Re-add the foreign key constraint (now allowing NULL)
ALTER TABLE public.survey_responses
ADD CONSTRAINT survey_responses_ticket_id_fkey
FOREIGN KEY (ticket_id)
REFERENCES public.tickets(id)
ON DELETE NO ACTION
ON UPDATE NO ACTION;

-- Note: The foreign key constraint will allow NULL values by default
-- This means survey_responses can exist without a ticket_id

