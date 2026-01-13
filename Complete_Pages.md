# VirtualBoard AI — Complete Pages Audit & Creation

You are an expert developer. Your task is to audit the entire VirtualBoard AI application, identify ALL missing pages and routes, then create them.

## Phase 1: Comprehensive Route Audit

### Step 1.1: Map the Current Route Structure
List ALL files in these directories recursively:
- `app/`
- `app/(auth)/`
- `app/(dashboard)/`
- `app/api/`

Create a complete tree view of existing routes.

### Step 1.2: Analyze Navigation Links
Search and extract ALL navigation links from:
- `components/` - ALL files containing `href=` or `Link`
- `app/` - ALL files containing `redirect(` or `router.push(`
```bash
# Search for all internal links
grep -r "href=\"/" --include="*.tsx" --include="*.ts" .
grep -r "redirect\(" --include="*.tsx" --include="*.ts" .
grep -r "router.push\(" --include="*.tsx" --include="*.ts" .
```

### Step 1.3: Check Sidebar/Navigation Components
Examine these files for menu items:
- `components/Sidebar.tsx` or `components/nav/`
- `components/Header.tsx`
- `components/layout/`
- Any `Navigation` or `Menu` component

List ALL menu items and their target routes.

### Step 1.4: Check Database Schema for Entities
Review the database schema to identify entities that need CRUD pages:
- `supabase/migrations/` - ALL migration files

Expected entities typically need:
- List page: `/entity`
- Detail page: `/entity/[id]`
- Create page: `/entity/new`
- Edit page: `/entity/[id]/edit`

---

## Phase 2: Gap Analysis

### Step 2.1: Create Route Inventory Table

Create a table with this format:

| Route | Status | File Path | Notes |
|-------|--------|-----------|-------|
| `/` | ✅ Exists | `app/page.tsx` | Landing page |
| `/login` | ✅ Exists | `app/(auth)/login/page.tsx` | |
| `/dashboard` | ❓ Check | | |
| `/dashboard/projects` | ❓ Check | | |
| `/dashboard/projects/[projectId]` | ❓ Check | | |
| `/dashboard/projects/[projectId]/knowledge` | ❌ Missing | | 404 error reported |
| `/dashboard/projects/[projectId]/meetings` | ❓ Check | | |
| `/dashboard/projects/[projectId]/settings` | ❓ Check | | |
| `/dashboard/team` | ❓ Check | | |
| `/dashboard/settings` | ❓ Check | | |

### Step 2.2: Identify ALL Missing Routes

Based on:
1. Navigation links that have no corresponding page
2. Database entities without CRUD pages
3. Standard SaaS patterns (settings, profile, etc.)
4. Links referenced in UI components

List every missing route.

---

## Phase 3: Expected Routes Checklist

Verify these routes exist (create if missing):

### Authentication Routes
- [ ] `/login` - Login page
- [ ] `/signup` - Registration page
- [ ] `/forgot-password` - Password reset request
- [ ] `/reset-password` - Password reset form
- [ ] `/auth/callback` - OAuth callback

### Dashboard Routes
- [ ] `/dashboard` - Main dashboard/overview
- [ ] `/dashboard/projects` - Projects list
- [ ] `/dashboard/team` - Team management
- [ ] `/dashboard/settings` - User/app settings

### Project Routes
- [ ] `/dashboard/projects/new` - Create new project
- [ ] `/dashboard/projects/[projectId]` - Project detail/overview
- [ ] `/dashboard/projects/[projectId]/knowledge` - Knowledge base/documents
- [ ] `/dashboard/projects/[projectId]/knowledge/upload` - Upload documents
- [ ] `/dashboard/projects/[projectId]/meetings` - Meetings list
- [ ] `/dashboard/projects/[projectId]/meetings/new` - Create meeting
- [ ] `/dashboard/projects/[projectId]/meetings/[meetingId]` - Meeting session
- [ ] `/dashboard/projects/[projectId]/settings` - Project settings
- [ ] `/dashboard/projects/[projectId]/edit` - Edit project

### Meeting Routes
- [ ] `/dashboard/meetings` - All meetings (optional global view)
- [ ] `/dashboard/meetings/[meetingId]` - Direct meeting access

### API Routes
- [ ] `/api/ai/chat` - Chat streaming
- [ ] `/api/ai/moderate` - Moderator decisions
- [ ] `/api/ai/embed` - Generate embeddings
- [ ] `/api/documents/upload` - Document upload
- [ ] `/api/meetings/[meetingId]/end` - End meeting

### Static/Marketing Pages (if applicable)
- [ ] `/` - Landing page
- [ ] `/about` - About page
- [ ] `/pricing` - Pricing page
- [ ] `/contact` - Contact page

---

## Phase 4: Create Missing Pages

For EACH missing page, create it following these patterns:

### Pattern A: List Page
```tsx
// app/(dashboard)/[entity]/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function EntityListPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: items } = await supabase
    .from('entity')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Entities</h1>
        <Link href="/dashboard/entity/new">
          <Button>Create New</Button>
        </Link>
      </div>
      {/* List rendering */}
    </div>
  )
}
```

### Pattern B: Detail Page
```tsx
// app/(dashboard)/[entity]/[id]/page.tsx
interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EntityDetailPage({ params }: PageProps) {
  const { id } = await params
  // Fetch and display entity
}
```

### Pattern C: Form Page (Create/Edit)
```tsx
// app/(dashboard)/[entity]/new/page.tsx
'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'

export default function CreateEntityPage() {
  const router = useRouter()
  // Form implementation
}
```

### Pattern D: Nested Project Page
```tsx
// app/(dashboard)/projects/[projectId]/[feature]/page.tsx
interface PageProps {
  params: Promise<{ projectId: string }>
}

export default async function FeaturePage({ params }: PageProps) {
  const { projectId } = await params
  // Verify project access, then render feature
}
```

---

## Phase 5: Implementation

### Step 5.1: Create Each Missing Page
For each missing route identified in Phase 2:
1. Create the file in correct location
2. Implement using appropriate pattern
3. Add proper TypeScript types
4. Include authentication checks
5. Handle loading and error states

### Step 5.2: Update Navigation
Ensure all navigation components link to valid routes:
- Sidebar menu items
- Header navigation
- Breadcrumbs
- Back buttons

### Step 5.3: Add Loading States
For each new page, create corresponding:
- `loading.tsx` - Loading skeleton
- `error.tsx` - Error boundary (where appropriate)

---

## Phase 6: Verification

### Step 6.1: Route Testing Checklist
After creating all pages, verify each route:
```bash
# Start dev server
npm run dev
```

Test each route manually or create a test script:
- [ ] No 404 errors on any navigation
- [ ] All links work correctly
- [ ] Authentication redirects work
- [ ] Data loads correctly

### Step 6.2: Build Verification
```bash
npm run build
```
- [ ] No build errors
- [ ] All pages compile successfully

### Step 6.3: Final Report
Provide a summary:
- Total routes audited
- Missing routes found
- Routes created
- Any remaining issues

---

## Execution Instructions

1. **Start with Phase 1** - Complete the full audit first
2. **Report findings** before creating any files
3. **Create pages in batches** by feature area
4. **Test each batch** before proceeding
5. **Provide progress updates** after each phase

Begin with Phase 1, Step 1.1 - Map the current route structure.