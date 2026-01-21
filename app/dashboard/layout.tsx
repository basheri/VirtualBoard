import { createServerClient } from '@/lib/supabase/server';
import { Sidebar } from '@/components/shared/Sidebar';
import { Header } from '@/components/shared/Header';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex h-screen bg-muted/40">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header user={user} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}