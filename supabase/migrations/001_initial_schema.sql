-- Enable pgvector extension
create extension if not exists vector;

-- Users table (managed by Supabase Auth, this extends it)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Projects table
create table public.projects (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  strategy text not null check (strategy in ('GROWTH', 'SAFETY', 'BALANCED')),
  user_id uuid references public.profiles on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Meetings table
create table public.meetings (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  strategy text not null check (strategy in ('GROWTH', 'SAFETY', 'BALANCED')),
  status text not null default 'ACTIVE' check (status in ('ACTIVE', 'COMPLETED', 'ARCHIVED')),
  project_id uuid references public.projects on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Messages table
create table public.messages (
  id uuid default gen_random_uuid() primary key,
  content text not null,
  sender_role text not null check (sender_role in ('USER', 'AGENT')),
  sender_name text not null,
  sender_agent_id text,
  meeting_id uuid references public.meetings on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Meeting agents junction table
create table public.meeting_agents (
  meeting_id uuid references public.meetings on delete cascade not null,
  agent_id text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (meeting_id, agent_id)
);

-- Documents table
create table public.documents (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content text not null,
  file_type text not null check (file_type in ('pdf', 'txt', 'docx')),
  file_size integer not null,
  project_id uuid references public.projects on delete cascade not null,
  embedding_id uuid,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Document embeddings table
create table public.document_embeddings (
  id uuid default gen_random_uuid() primary key,
  document_id uuid references public.documents on delete cascade not null,
  project_id uuid references public.projects on delete cascade not null,
  content text not null,
  embedding vector(1536) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.meetings enable row level security;
alter table public.messages enable row level security;
alter table public.meeting_agents enable row level security;
alter table public.documents enable row level security;
alter table public.document_embeddings enable row level security;

-- Create RLS policies

-- Profiles policies
create policy "Users can view their own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update their own profile" on public.profiles
  for update using (auth.uid() = id);

-- Projects policies
create policy "Users can view their own projects" on public.projects
  for select using (auth.uid() = user_id);

create policy "Users can create their own projects" on public.projects
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own projects" on public.projects
  for update using (auth.uid() = user_id);

create policy "Users can delete their own projects" on public.projects
  for delete using (auth.uid() = user_id);

-- Meetings policies
create policy "Users can view meetings for their projects" on public.meetings
  for select using (
    project_id in (
      select id from public.projects where user_id = auth.uid()
    )
  );

create policy "Users can create meetings for their projects" on public.meetings
  for insert with check (
    project_id in (
      select id from public.projects where user_id = auth.uid()
    )
  );

create policy "Users can update meetings for their projects" on public.meetings
  for update using (
    project_id in (
      select id from public.projects where user_id = auth.uid()
    )
  );

create policy "Users can delete meetings for their projects" on public.meetings
  for delete using (
    project_id in (
      select id from public.projects where user_id = auth.uid()
    )
  );

-- Messages policies
create policy "Users can view messages for their meetings" on public.messages
  for select using (
    meeting_id in (
      select m.id from public.meetings m
      join public.projects p on m.project_id = p.id
      where p.user_id = auth.uid()
    )
  );

create policy "Users can create messages for their meetings" on public.messages
  for insert with check (
    meeting_id in (
      select m.id from public.meetings m
      join public.projects p on m.project_id = p.id
      where p.user_id = auth.uid()
    )
  );

-- Documents policies
create policy "Users can view documents for their projects" on public.documents
  for select using (
    project_id in (
      select id from public.projects where user_id = auth.uid()
    )
  );

create policy "Users can create documents for their projects" on public.documents
  for insert with check (
    project_id in (
      select id from public.projects where user_id = auth.uid()
    )
  );

create policy "Users can update documents for their projects" on public.documents
  for update using (
    project_id in (
      select id from public.projects where user_id = auth.uid()
    )
  );

create policy "Users can delete documents for their projects" on public.documents
  for delete using (
    project_id in (
      select id from public.projects where user_id = auth.uid()
    )
  );

-- Create function for vector similarity search
create or replace function search_documents_by_embedding(
  project_id uuid,
  query_embedding vector(1536),
  similarity_threshold float default 0.7,
  match_count int default 5
)
returns table (
  id uuid,
  title text,
  content text,
  similarity float
)
language sql stable
as $$
  select
    d.id,
    d.title,
    d.content,
    1 - (de.embedding <=> query_embedding) as similarity
  from public.documents d
  join public.document_embeddings de on d.id = de.document_id
  where 
    de.project_id = search_documents_by_embedding.project_id
    and 1 - (de.embedding <=> query_embedding) > similarity_threshold
  order by de.embedding <=> query_embedding
  limit match_count;
$$;

-- Create function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger for new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create indexes for better performance
create index idx_projects_user_id on public.projects(user_id);
create index idx_meetings_project_id on public.meetings(project_id);
create index idx_messages_meeting_id on public.messages(meeting_id);
create index idx_documents_project_id on public.documents(project_id);
create index idx_document_embeddings_project_id on public.document_embeddings(project_id);
create index idx_document_embeddings_embedding on public.document_embeddings using hnsw (embedding vector_cosine_ops);