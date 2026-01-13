-- Meeting Memories table for Cross-Meeting Context
create table if not exists public.meeting_memories (
  id uuid default gen_random_uuid() primary key,
  meeting_id uuid references public.meetings on delete cascade not null,
  project_id uuid references public.projects on delete cascade not null,
  summary text not null,
  decision text,
  embedding vector(1536) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.meeting_memories enable row level security;

-- Policies
create policy "Users can view memories for their projects" on public.meeting_memories
  for select using (
    project_id in (
      select id from public.projects where user_id = auth.uid()
    )
  );

create policy "Users can create memories for their projects" on public.meeting_memories
  for insert with check (
    project_id in (
      select id from public.projects where user_id = auth.uid()
    )
  );

-- Indexes
create index if not exists idx_meeting_memories_project_id on public.meeting_memories(project_id);
create index if not exists idx_meeting_memories_embedding on public.meeting_memories using hnsw (embedding vector_cosine_ops);

-- Search Function
create or replace function search_memories_by_embedding(
  project_id uuid,
  query_embedding vector(1536),
  similarity_threshold float default 0.7,
  match_count int default 5
)
returns table (
  id uuid,
  summary text,
  decision text,
  similarity float
)
language sql stable
as $$
  select
    id,
    summary,
    decision,
    1 - (embedding <=> query_embedding) as similarity
  from public.meeting_memories
  where 
    project_id = search_memories_by_embedding.project_id
    and 1 - (embedding <=> query_embedding) > similarity_threshold
  order by embedding <=> query_embedding
  limit match_count;
$$;
