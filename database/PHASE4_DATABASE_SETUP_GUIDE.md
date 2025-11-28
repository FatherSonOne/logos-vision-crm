# Phase 4 Complete Database Integration Setup Guide

This guide will help you set up comprehensive database integration for Logos Vision CRM, including Row Level Security (RLS), Storage buckets, and database-level validation.

## 📋 Prerequisites

Before running these scripts, ensure you have:

1. ✅ A Supabase project created
2. ✅ Your Supabase URL and anon key configured in `.env.local`
3. ✅ The main database schema created (from `schema.sql`)
4. ✅ Supabase CLI installed (optional, for local development)
5. ✅ Admin access to your Supabase dashboard

## 🚀 Quick Setup (Recommended)

### Option 1: Using Supabase Dashboard

1. **Go to SQL Editor** in your Supabase dashboard
2. **Run scripts in this order:**

```sql
-- Step 1: Run the complete RLS and Storage policies
-- Copy and paste: database/phase4_complete_rls_storage.sql
-- Execution time: ~30-60 seconds

-- Step 2: Run the database validation constraints
-- Copy and paste: database/phase4_database_validation.sql
-- Execution time: ~20-30 seconds
```

3. **Verify setup** using the verification queries at the end of each script

### Option 2: Using Supabase CLI

```bash
# Navigate to your project directory
cd /path/to/logos-vision-crm

# Run RLS and Storage setup
supabase db push --file database/phase4_complete_rls_storage.sql

# Run database validation setup
supabase db push --file database/phase4_database_validation.sql
```

## 📁 What Each File Does

### 1. `phase4_complete_rls_storage.sql`

**Purpose**: Sets up comprehensive Row Level Security and Storage buckets

**What it includes:**
- ✅ Storage bucket creation (documents, images, avatars)
- ✅ Helper functions for role-based access (is_admin, is_manager_or_admin, is_staff)
- ✅ RLS policies for all tables based on user roles
- ✅ Storage policies with mime type and size restrictions
- ✅ Proper folder structure enforcement

**Key Features:**
- **4 User Roles**: Admin, Manager, Consultant, Client
- **3 Storage Buckets**:
  - `documents` (private, 50MB, documents only)
  - `images` (public, 10MB, images only)
  - `avatars` (public, 5MB, profile pictures)
- **Granular Permissions**: Different access levels for different roles

### 2. `phase4_database_validation.sql`

**Purpose**: Adds database-level validation and business logic

**What it includes:**
- ✅ CHECK constraints for data validation (emails, phones, URLs)
- ✅ Auto-update triggers for timestamps
- ✅ Business logic triggers (prevent invalid deletes)
- ✅ Performance indexes for common queries
- ✅ Optional audit logging system

**Key Features:**
- **Email Validation**: Ensures valid email formats
- **Phone Validation**: Requires minimum 10 digits
- **Date Range Validation**: End date must be after start date
- **Referential Integrity**: Prevents deleting clients with active projects
- **Performance Indexes**: Optimizes common query patterns

## 🔐 User Roles and Permissions

### Admin (Full Access)
- ✅ Full CRUD on all data
- ✅ Can delete any records
- ✅ Can manage team members
- ✅ Access to audit logs
- ✅ Upload/manage all files

### Manager (Management Access)
- ✅ View all data
- ✅ Create/update most records
- ❌ Limited delete permissions (no clients, team members)
- ✅ Upload documents and images
- ❌ Cannot modify team members

### Consultant (Limited Access)
- ✅ View assigned projects only
- ✅ View related clients
- ✅ Create/update tasks on assigned projects
- ✅ Create activities
- ❌ Cannot delete anything
- ✅ Upload project documents

### Client (Read-Only Own Data)
- ✅ View their own organization
- ✅ View their projects
- ✅ View shared tasks and activities
- ✅ View related cases
- ❌ Cannot create/update/delete
- ✅ Read documents related to them

## 📦 Storage Buckets Configuration

### Documents Bucket
```javascript
{
  id: 'documents',
  public: false,
  maxFileSize: 52428800, // 50MB
  allowedMimeTypes: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv'
  ],
  folderStructure: 'documents/{category}/{entity_id}/filename.ext'
}
```

### Images Bucket
```javascript
{
  id: 'images',
  public: true,
  maxFileSize: 10485760, // 10MB
  allowedMimeTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml'
  ],
  uses: ['Event banners', 'Email headers', 'Website images']
}
```

### Avatars Bucket
```javascript
{
  id: 'avatars',
  public: true,
  maxFileSize: 5242880, // 5MB
  allowedMimeTypes: [
    'image/jpeg',
    'image/png',
    'image/webp'
  ],
  folderStructure: 'avatars/{user_id}.{ext}'
}
```

## 🧪 Testing Your Setup

### Test 1: Verify RLS is Enabled

```sql
-- Should show rowsecurity = true for all tables
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename NOT LIKE 'pg_%'
ORDER BY tablename;
```

### Test 2: Verify Policies Exist

```sql
-- Should show policies for each table
SELECT tablename, COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;
```

### Test 3: Verify Storage Buckets

```sql
-- Should show all 3 buckets
SELECT id, name, public, file_size_limit
FROM storage.buckets
ORDER BY name;
```

### Test 4: Test Role-Based Access

```sql
-- Set a test user's role
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"Manager"'
)
WHERE email = 'test@example.com';

-- Login as that user and try to query data
-- Should only see data according to their role
```

### Test 5: Test Validation Constraints

```sql
-- This should FAIL (invalid email)
INSERT INTO clients (name, email, phone, location)
VALUES ('Test Client', 'not-an-email', '1234567890', 'Test City');

-- This should SUCCEED
INSERT INTO clients (name, email, phone, location)
VALUES ('Valid Client', 'valid@example.com', '1234567890', 'Valid City');
```

## 🔧 Setting User Roles

### In Supabase Dashboard (SQL Editor):

```sql
-- Set user as Admin
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"Admin"'
)
WHERE email = 'admin@yourorg.com';

-- Set user as Manager
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"Manager"'
)
WHERE email = 'manager@yourorg.com';

-- Set user as Consultant
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"Consultant"'
)
WHERE email = 'consultant@yourorg.com';

-- Set user as Client
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"Client"'
)
WHERE email = 'client@clientorg.com';
```

### In Your Application Code:

```typescript
// When signing up a new user
const { data, error } = await supabase.auth.signUp({
  email: 'newuser@example.com',
  password: 'secure_password',
  options: {
    data: {
      role: 'Consultant', // Set initial role
      name: 'John Doe'
    }
  }
});
```

## 📤 File Upload Examples

### Upload a Document

```typescript
// Upload to documents bucket with proper folder structure
const file = new File(['content'], 'contract.pdf', { type: 'application/pdf' });

const { data, error } = await supabase.storage
  .from('documents')
  .upload(`client/${clientId}/contract.pdf`, file, {
    cacheControl: '3600',
    upsert: false
  });
```

### Upload an Event Banner

```typescript
// Upload to public images bucket
const file = new File(['image'], 'banner.jpg', { type: 'image/jpeg' });

const { data, error } = await supabase.storage
  .from('images')
  .upload(`events/banner-${eventId}.jpg`, file, {
    cacheControl: '3600',
    upsert: true
  });

// Get public URL
const { data: urlData } = supabase.storage
  .from('images')
  .getPublicUrl(`events/banner-${eventId}.jpg`);

console.log(urlData.publicUrl);
```

### Upload User Avatar

```typescript
// Upload user's profile picture
const file = new File(['image'], 'avatar.png', { type: 'image/png' });
const userId = (await supabase.auth.getUser()).data.user?.id;

const { data, error } = await supabase.storage
  .from('avatars')
  .upload(`${userId}/avatar.png`, file, {
    cacheControl: '3600',
    upsert: true
  });
```

## 🐛 Troubleshooting

### Issue: "RLS policy violation"
**Solution**: Check the user's role in `auth.users.raw_user_meta_data.role`
```sql
SELECT email, raw_user_meta_data->>'role' as role
FROM auth.users
WHERE email = 'user@example.com';
```

### Issue: "File upload fails with permission denied"
**Solution**: Verify storage policies are created
```sql
SELECT *
FROM pg_policies
WHERE tablename = 'objects'
AND schemaname = 'storage';
```

### Issue: "CHECK constraint violation"
**Solution**: Review the validation error message, it will tell you which constraint failed
```sql
-- View all constraints on a table
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'clients'::regclass
AND contype = 'c';
```

### Issue: "Function does not exist"
**Solution**: Re-run the helper functions section from `phase4_complete_rls_storage.sql`

## 📊 Performance Considerations

### Indexes Created
The validation script creates indexes on:
- Email fields (for user lookup)
- Foreign keys (client_id, project_id, etc.)
- Status fields (for filtering)
- Date fields (for sorting)
- Shared flags (for client portal queries)

### Query Optimization Tips
1. Always filter by indexed columns when possible
2. Use `shared_with_client = true` filter for client portal queries
3. Use `archived = false` filter for active records
4. Leverage the created indexes for optimal performance

## 🔄 Updating Policies

If you need to modify policies later:

```sql
-- Drop a specific policy
DROP POLICY IF EXISTS "policy_name" ON table_name;

-- Recreate with new definition
CREATE POLICY "policy_name" ON table_name
  FOR SELECT
  USING (your_condition);
```

## 📝 Audit Logging (Optional)

To enable audit logging, uncomment the triggers in `phase4_database_validation.sql`:

```sql
-- Enable audit logging for clients table
CREATE TRIGGER audit_clients
  AFTER INSERT OR UPDATE OR DELETE ON clients
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();
```

View audit logs (Admin only):
```sql
SELECT *
FROM audit_log
WHERE table_name = 'clients'
ORDER BY performed_at DESC
LIMIT 100;
```

## ✅ Setup Checklist

- [ ] Run `phase4_complete_rls_storage.sql` in Supabase SQL Editor
- [ ] Run `phase4_database_validation.sql` in Supabase SQL Editor
- [ ] Verify RLS is enabled on all tables
- [ ] Verify storage buckets are created
- [ ] Set up initial user roles
- [ ] Test file upload to each bucket
- [ ] Test role-based access with test users
- [ ] Verify validation constraints work
- [ ] Review indexes for your query patterns
- [ ] (Optional) Enable audit logging on critical tables

## 🎉 You're Done!

Your database now has:
- ✅ Comprehensive Row Level Security
- ✅ Role-based access control
- ✅ Configured storage buckets with validation
- ✅ Database-level data validation
- ✅ Performance indexes
- ✅ Business logic protection
- ✅ Optional audit logging

## 📚 Additional Resources

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [PostgreSQL CHECK Constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)
- [PostgreSQL Triggers](https://www.postgresql.org/docs/current/triggers.html)

## 🆘 Need Help?

If you encounter issues:
1. Check the verification queries at the end of each SQL file
2. Review the troubleshooting section above
3. Check Supabase logs in the dashboard
4. Verify your environment variables are set correctly
