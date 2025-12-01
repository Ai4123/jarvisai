-- Cleanup script for orphaned chats and related data
-- This handles the cascade deletion properly

-- Step 1: Find orphaned chats (chats with user_id that doesn't exist in public.users)
SELECT 
    c.id as chat_id,
    c.user_id,
    c.status,
    c.created_at,
    (SELECT COUNT(*) FROM public.tickets WHERE chat_id = c.id) as ticket_count,
    (SELECT COUNT(*) FROM public.messages WHERE chat_id = c.id) as message_count
FROM public.chats c
LEFT JOIN public.users u ON c.user_id = u.id
WHERE u.id IS NULL;

-- Step 2: Delete related data first (tickets and messages)
-- Delete tickets for orphaned chats
DELETE FROM public.tickets 
WHERE chat_id IN (
    SELECT c.id
    FROM public.chats c
    LEFT JOIN public.users u ON c.user_id = u.id
    WHERE u.id IS NULL
);

-- Delete messages for orphaned chats
DELETE FROM public.messages 
WHERE chat_id IN (
    SELECT c.id
    FROM public.chats c
    LEFT JOIN public.users u ON c.user_id = u.id
    WHERE u.id IS NULL
);

-- Step 3: Now delete the orphaned chats
DELETE FROM public.chats 
WHERE user_id NOT IN (SELECT id FROM public.users);

-- Step 4: Verify cleanup
SELECT 
    COUNT(*) as remaining_orphaned_chats
FROM public.chats c
LEFT JOIN public.users u ON c.user_id = u.id
WHERE u.id IS NULL;

-- Should return 0 if cleanup was successful

