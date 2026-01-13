# Environment Variables

## Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key | `eyJhbGc...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) | `eyJhbGc...` |
| `OPENAI_API_KEY` | OpenAI API key for GPT-4o and embeddings | `sk-...` |

## Setup

1. Copy `.env.example` to `.env.local`
2. Fill in all required values
3. Never commit `.env.local` to version control

## Getting Keys

### Supabase
1. Go to `https://supabase.com` 
2. Open your project → Settings → API
3. Copy URL and keys

### OpenAI
1. Go to `https://platform.openai.com` 
2. API Keys → Create new key
