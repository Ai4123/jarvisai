-- Migration: Update tickets.user_id foreign key to reference public.users instead of auth.users
-- Run this in your Supabase SQL Editor

-- Step 1: Check current constraint
SELECT 
    tc.constraint_name, 
    tc.table_schema,
    tc.table_name, 
    kcu.column_name, 
    ccu.table_schema AS foreign_table_schema,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'tickets' 
  AND tc.table_schema = 'public'
  AND tc.constraint_type = 'FOREIGN KEY'
  AND kcu.column_name = 'user_id';

-- Step 2: Check for orphaned tickets
SELECT 
    t.id as ticket_id,
    t.user_id,
    t.title,
    t.created_at
FROM public.tickets t
LEFT JOIN public.users u ON t.user_id = u.id
WHERE u.id IS NULL;

-- Step 3: Delete orphaned tickets (if any)
DELETE FROM public.tickets 
WHERE user_id NOT IN (SELECT id FROM public.users);

-- Step 4: Drop the existing foreign key constraint
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT constraint_name
        FROM information_schema.table_constraints
        WHERE table_schema = 'public'
          AND table_name = 'tickets'
          AND constraint_type = 'FOREIGN KEY'
          AND constraint_name IN (
              SELECT constraint_name
              FROM information_schema.key_column_usage
              WHERE table_schema = 'public'
                AND table_name = 'tickets'
                AND column_name = 'user_id'
          )
    ) LOOP
        EXECUTE 'ALTER TABLE public.tickets DROP CONSTRAINT IF EXISTS ' || quote_ident(r.constraint_name);
        RAISE NOTICE 'Dropped constraint: %', r.constraint_name;
    END LOOP;
END $$;

-- Step 5: Add new foreign key constraint pointing to public.users
ALTER TABLE public.tickets 
ADD CONSTRAINT tickets_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.users(id) 
ON DELETE CASCADE 
ON UPDATE NO ACTION;

-- Step 6: Verify the change
SELECT 
    tc.constraint_name, 
    tc.table_schema,
    tc.table_name, 
    kcu.column_name, 
    ccu.table_schema AS foreign_table_schema,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'tickets' 
  AND tc.table_schema = 'public'
  AND tc.constraint_type = 'FOREIGN KEY'
  AND kcu.column_name = 'user_id';

-- Expected result:
-- foreign_table_schema should be 'public'
-- foreign_table_name should be 'users'
-- foreign_column_name should be 'id'

