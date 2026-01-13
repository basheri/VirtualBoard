# VirtualBoard AI

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC)
![Supabase](https://img.shields.io/badge/Supabase-Postgres-green)

An AI-powered virtual advisory board platform that simulates board meetings with multiple AI advisors (CFO, CTO, Legal, CMO, Moderator) based on different business strategies (Growth, Safety, Balanced).

## 🚀 Features

- **Multi-Agent AI Board**: Real-time interaction with 5 specialized AI agents.
- **Strategy-Based Decision Making**: Agents adapt their advice based on the chosen strategy weightings.
- **Knowledge Base (RAG)**: Upload PDF documents to provide context-aware answers using Vector Embeddings.
- **Memory System**: Automatically stores meeting summaries and key decisions for long-term project context.
- **Decision Records**: Export formal PDF reports of meeting outcomes.
- **Bilingual Support**: Full English & Arabic (RTL) UI support.
- **Secure Authentication**: Enterprise-grade auth via Supabase.

## 🛠 Tech Stack

- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS v4, Shadcn/UI
- **AI Engine**: Vercel AI SDK, OpenAI GPT-4o
- **Backend/DB**: Supabase (PostgreSQL, Auth, pgvector)
- **State Management**: React Context (Language), Server Components
- **PDF Processing**: `pdf-parse` (Ingestion), `jspdf` (Export)

## 🏁 Getting Started

### Prerequisites

- Node.js 18+
- Supabase Account
- OpenAI API Key

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd virtualboard-ai
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env.local` file:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   OPENAI_API_KEY=your_openai_api_key
   ```

4. **Set up Supabase Database:**
   - Create a new project in Supabase.
   - Go to the SQL Editor and run the migration scripts in order:
     1. `supabase/migrations/001_initial_schema.sql` (Tables & RLS)
     2. `supabase/migrations/002_add_memories.sql` (Memory System)
   - Alternatively, link via CLI:
     ```bash
     npx supabase login
     npx supabase link --project-ref <your-project-ref>
     npx supabase db push
     ```

5. **Run the development server:**
   ```bash
   npm run dev
   ```

6. **Open the application:**
   Visit [http://localhost:3000](http://localhost:3000) (or port 3001 if 3000 is busy).

## 📂 Project Structure

```
virtualboard-ai/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Login/Signup
│   ├── (dashboard)/       # Main App Interface
│   └── api/               # Server-side API Routes (AI, Uploads)
├── components/            # React Components
│   ├── agents/            # AI Agent UI
│   ├── documents/         # Upload & List UI
│   ├── landing/           # Landing Page Sections
│   ├── meetings/          # Chat & Meeting Logic
│   └── shared/            # Layout Components (Header, Sidebar)
├── lib/                   # Core Logic
│   ├── ai/                # RAG, Embeddings, Agent Prompts
│   ├── i18n/              # Language Context & Dictionary
│   └── supabase/          # DB Clients
└── supabase/              # Database Migrations
```

## 🤖 AI Advisors

- **CFO**: Financial analysis, ROI, budget planning.
- **CTO**: Tech stack, security, scalability.
- **Legal**: Compliance, risk, regulatory.
- **CMO**: Branding, market fit, growth.
- **Moderator**: Synthesizes conflicting views and drives decisions.

## 🌍 Localization

The platform uses a `LanguageContext` provider to handle EN/AR switching. It automatically adjusts `dir="rtl"` for Arabic layouts and swaps fonts (IBM Plex Sans Arabic).

## 📄 License

[MIT](LICENSE)
