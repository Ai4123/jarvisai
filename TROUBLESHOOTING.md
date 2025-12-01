# Troubleshooting Guide

## Error: Foreign Key Constraint Violation

If you're getting this error:
```
ERROR: 23503: insert or update on table "chats" violates foreign key constraint "chats_user_id_fkey"
DETAIL: Key (user_id)=(...) is not present in table "users".
```

### Step 1: Verify Migration Was Applied

Run this SQL in Supabase SQL Editor:
```sql
-- Check current foreign key constraint
SELECT 
    tc.constraint_name, 
    ccu.table_schema AS foreign_table_schema,
    ccu.table_name AS foreign_table_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'chats' 
  AND tc.table_schema = 'public'
  AND tc.constraint_type = 'FOREIGN KEY'
  AND kcu.column_name = 'user_id';
```

**Expected Result:**
- `foreign_table_schema` should be `public`
- `foreign_table_name` should be `users`

If it shows `auth` and `users`, the migration hasn't been applied yet. Run the migration SQL.

### Step 2: Verify User Exists

Check if the user_id from the error exists in `public.users`:

```sql
SELECT id, name, email, created_at
FROM public.users
WHERE id = 'YOUR_USER_ID_FROM_ERROR';
```

If no rows are returned, the user doesn't exist. This could mean:
1. The JWT workflow didn't create the user successfully
2. The user_id in the JWT doesn't match the database

### Step 3: Check JWT Workflow

1. Test the login endpoint in N8N
2. Verify the response includes both `token` and `user_id`
3. Check that the `user_id` matches a record in `public.users`

### Step 4: Debug Frontend

1. Open browser console
2. Check the logs when creating a chat:
   - Look for "✅ Found user_id in JWT token"
   - Look for "✅ Verified user_id exists in database"
   - If you see "⚠️ user_id from JWT not found in database", the user doesn't exist

### Step 5: Re-login

If the user doesn't exist:
1. Log out
2. Log in again (this will create the user via the JWT workflow)
3. Try creating a chat again

### Common Issues

1. **Migration not applied**: Foreign key still points to `auth.users`
   - **Solution**: Run the migration SQL script

2. **User not created**: JWT workflow didn't create user in database
   - **Solution**: Check N8N workflow execution logs, ensure Supabase credentials are correct

3. **User_id mismatch**: JWT contains user_id that doesn't exist
   - **Solution**: Log out and log in again to get a fresh token with correct user_id

4. **Timing issue**: User creation and chat creation happening simultaneously
   - **Solution**: Add a small delay or ensure user creation completes before chat creation

