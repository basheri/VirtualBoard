'use client';

import { cn } from "@/lib/utils";
import { Button } from '@/components/ui/button';
import {
  Home,
  Users,
  FileText,
  Settings
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useLanguage } from '@/hooks/useLanguage';

export function Sidebar() {
  const pathname = usePathname();
  const { t } = useLanguage();

  const sidebarItems = [
    {
      title: t.sidebar?.dashboard || 'Dashboard',
      href: '/dashboard/projects',
      icon: Home,
    },
    {
      title: t.sidebar?.projects || 'Projects',
      href: '/dashboard/projects',
      icon: FileText,
    },
    {
      title: t.sidebar?.team || 'Team',
      href: '/dashboard/team',
      icon: Users,
    },
    {
      title: t.sidebar?.settings || 'Settings',
      href: '/dashboard/settings',
      icon: Settings,
    },
  ];

  return (
    <div className="w-64 bg-background border-r p-4 space-y-4">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold px-2">VirtualBoard AI</h2>
        <p className="text-sm text-muted-foreground px-2">
          {t.sidebar?.subtitle || 'Advisory Board Platform'}
        </p>
      </div>

      <nav className="space-y-2 relative">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);

          return (
            <Link key={item.title} href={item.href} passHref>
              <Button
                variant={isActive ? 'default' : 'ghost'}
                className={cn(
                  'w-full justify-start relative transition-all duration-200',
                  isActive && 'bg-primary text-primary-foreground shadow-md',
                  !isActive && 'hover:bg-accent/50 hover:translate-x-1'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-indicator"
                    className="absolute left-0 w-1 h-full bg-primary-foreground rounded-r-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <Icon className="mr-2 h-4 w-4" />
                {item.title}
              </Button>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}