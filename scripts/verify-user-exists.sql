-- Verify if a specific user exists in public.users table
-- Replace 'YOUR_USER_ID_HERE' with the actual user_id from the error

SELECT 
    id,
    name,
    email,
    created_at
FROM public.users
WHERE id = 'de3645d8-30a8-442c-9de4-a25b76b158fe';

-- If this returns no rows, the user doesn't exist
-- Check if the user was created during login by checking all users:

SELECT 
    id,
    name,
    email,
    created_at
FROM public.users
ORDER BY created_at DESC
LIMIT 10;

