# Supabase Setup Guide

## 1. Create Supabase Project
1. Go to [Supabase](https://supabase.com) and sign in.
2. Click "New Project".
3. Choose your organization, name your project (e.g., "VirtualBoard AI"), and set a database password.
4. Select a region close to your users.
5. Click "Create new project".

## 2. Enable pgvector Extension
1. In your Supabase dashboard, go to **Database** → **Extensions**.
2. Search for `vector`.
3. Enable the `vector` extension.

## 3. Run Migrations
You need to run the SQL migrations to set up the database schema.

### Option A: Using Supabase Dashboard (SQL Editor)
1. Go to **SQL Editor** in the sidebar.
2. Open `supabase/migrations/001_initial_schema.sql` from this repository.
3. Copy the content and paste it into the SQL Editor.
4. Click "Run".
5. Repeat for `supabase/migrations/002_add_memories.sql`.
6. Repeat for `supabase/migrations/003_add_chunk_metadata.sql`.

### Option B: Using Supabase CLI
1. Login to Supabase CLI:
   ```bash
   npx supabase login
   ```
2. Link your project:
   ```bash
   npx supabase link --project-ref <your-project-ref>
   ```
   (You can find your project ref in Project Settings → General)
3. Push the migrations:
   ```bash
   npx supabase db push
   ```

## 4. Understanding RLS Policies
Row Level Security (RLS) is enabled for all tables to ensure data security.

- **projects**: Users can only see projects they created (based on `user_id`).
- **documents**: Users can only access documents linked to their projects.
- **meetings**: Users can only access meetings linked to their projects.
- **document_embeddings**: Inherits access from documents.
- **meeting_memories**: Inherits access from projects.

## 5. Testing the Setup
1. Sign up/Login to the application.
2. Create a new project.
3. If successful, the database connection and RLS policies are working correctly.
4. Upload a PDF document to test vector storage.
