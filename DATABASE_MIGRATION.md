# Database Migration Guide

## Update Foreign Key Constraint for chats.user_id

This migration updates the `chats` table to reference `public.users` instead of `auth.users`.

### Steps to Apply Migration

1. **Open Supabase SQL Editor**
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor

2. **Run the Migration SQL**
   - Copy and paste the contents of `prisma/migrations/update_chats_foreign_key.sql`
   - Execute the SQL script

3. **Verify the Migration**
   - The script includes a verification query at the end
   - Check that the foreign key now points to `public.users(id)`

### What This Migration Does

- **Drops** the existing foreign key constraint `chats_user_id_fkey` that references `auth.users.id`
- **Creates** a new foreign key constraint that references `public.users.id`
- **Maintains** CASCADE delete behavior (when a user is deleted, their chats are deleted)

### After Migration

1. Regenerate Prisma Client:
   ```bash
   npm run db:generate
   ```

2. Test chat creation to ensure everything works correctly

### Rollback (if needed)

If you need to rollback this change:

```sql
ALTER TABLE public.chats 
DROP CONSTRAINT IF EXISTS chats_user_id_fkey;

ALTER TABLE public.chats 
ADD CONSTRAINT chats_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE 
ON UPDATE NO ACTION;
```

