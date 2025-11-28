# Database Setup Instructions

## Step 1: Apply Notifications Schema

You need to run the notifications SQL schema in your Supabase project to enable the notification system.

### How to Apply:

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project: `logos-vision-crm`

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "+ New query"

3. **Copy and Run the Schema**
   - Open the file: `database/notifications_schema.sql`
   - Copy the entire contents
   - Paste into the Supabase SQL Editor
   - Click "Run" or press `Ctrl/Cmd + Enter`

4. **Verify Tables Were Created**
   ```sql
   -- Run this query to verify:
   SELECT table_name
   FROM information_schema.tables
   WHERE table_schema = 'public'
   AND table_name IN ('notifications', 'notification_preferences');
   ```

   You should see both tables listed.

5. **Verify Functions Were Created**
   ```sql
   -- Run this query to verify:
   SELECT routine_name
   FROM information_schema.routines
   WHERE routine_schema = 'public'
   AND routine_name IN (
     'create_notification',
     'mark_notification_read',
     'mark_all_notifications_read',
     'get_unread_notification_count',
     'get_user_role',
     'is_admin',
     'is_manager_or_admin',
     'is_staff'
   );
   ```

## What This Creates:

### Tables:
- **notifications** - Stores all user notifications with:
  - 12 notification types
  - 4 priority levels
  - Related entity tracking
  - Actor information
  - Read/unread status
  - Expiration support

- **notification_preferences** - User notification settings:
  - Email, push, in-app toggles
  - Per-type preferences
  - Quiet hours
  - Daily/weekly digest options

### Functions:
- `create_notification()` - Creates notifications with preference checking
- `mark_notification_read()` - Marks single notification as read
- `mark_all_notifications_read()` - Marks all as read for user
- `get_unread_notification_count()` - Gets count of unread notifications
- Helper functions for role checking (is_admin, is_staff, etc.)

### RLS Policies:
- Users can only see/modify their own notifications
- Secure by default with row-level security

### Triggers:
- Automatic notification creation when tasks are assigned

## Testing:

After applying the schema, you can test with:

```sql
-- Create a test notification
SELECT create_notification(
  p_user_id := auth.uid(),
  p_type := 'system',
  p_title := 'Test Notification',
  p_message := 'This is a test notification to verify the system works!',
  p_priority := 'normal'
);

-- Check if it was created
SELECT * FROM notifications
WHERE user_id = auth.uid()
ORDER BY created_at DESC
LIMIT 1;
```

## Troubleshooting:

### Error: "permission denied for schema public"
- Make sure you're running the query as the database owner
- Try running with: `SET ROLE postgres;` before the schema

### Error: "function already exists"
- The functions may already exist from a previous run
- Either drop them first or modify the CREATE statements to use `CREATE OR REPLACE`

### Error: "relation does not exist"
- Make sure RLS policies reference existing tables
- Verify table creation succeeded before running policies

## Next Steps:

Once the database is set up:
1. ✅ Notifications will appear in the NotificationBell component
2. ✅ Real-time updates will work automatically
3. ✅ Users can customize their preferences
4. ✅ Task assignments will auto-create notifications

---

**The app is already configured to use these features - just apply the database schema and they'll work!**
