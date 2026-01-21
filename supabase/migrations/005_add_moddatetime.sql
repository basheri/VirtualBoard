-- Enable moddatetime extension
create extension if not exists moddatetime schema extensions;

-- Create trigger to auto-update updated_at for profiles
create trigger handle_updated_at before update on public.profiles
  for each row execute procedure moddatetime (updated_at);

-- Create trigger to auto-update updated_at for projects
create trigger handle_updated_at before update on public.projects
  for each row execute procedure moddatetime (updated_at);

-- Create trigger to auto-update updated_at for meetings
create trigger handle_updated_at before update on public.meetings
  for each row execute procedure moddatetime (updated_at);

-- Create trigger to auto-update updated_at for documents
create trigger handle_updated_at before update on public.documents
  for each row execute procedure moddatetime (updated_at);
