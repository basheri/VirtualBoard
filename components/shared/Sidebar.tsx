'use client';

import { cn } from "@/lib/utils";
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Home, 
  Users, 
  FileText, 
  Settings,
  LogOut 
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

const sidebarItems = [
  {
    title: 'Dashboard',
    href: '/dashboard/projects',
    icon: Home,
  },
  {
    title: 'Projects',
    href: '/dashboard/projects',
    icon: FileText,
  },
  {
    title: 'Team',
    href: '/dashboard/team',
    icon: Users,
  },
  {
    title: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createBrowserClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="w-64 bg-background border-r p-4 space-y-4">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold px-2">VirtualBoard AI</h2>
        <p className="text-sm text-muted-foreground px-2">Advisory Board Platform</p>
      </div>
      
      <nav className="space-y-2">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);
          
          return (
            <Link key={item.title} href={item.href} passHref>
              <Button
                variant={isActive ? 'default' : 'ghost'}
                className={cn(
                  'w-full justify-start',
                  isActive && 'bg-primary text-primary-foreground'
                )}
              >
                <Icon className="mr-2 h-4 w-4" />
                {item.title}
              </Button>
            </Link>
          );
        })}
      </nav>
      
      <div className="mt-auto">
        <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}