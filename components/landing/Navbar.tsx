'use client';

import Link from 'next/link';
import { useLanguage } from '@/hooks/useLanguage';
import { Button, buttonVariants } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Navbar() {
  const { t, language, setLanguage, dir } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 bg-white rounded-sm transform rotate-45" />
          </div>
          <span className="font-heading font-bold text-xl text-primary">
            VirtualBoard AI
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/#features" className="text-gray-600 hover:text-primary transition-colors text-sm font-medium">
            {t.nav.features}
          </Link>
          <Link href="/#how-it-works" className="text-gray-600 hover:text-primary transition-colors text-sm font-medium">
            {t.nav.howItWorks}
          </Link>
          <Link href="/pricing" className="text-gray-600 hover:text-primary transition-colors text-sm font-medium">
            {t.nav.pricing}
          </Link>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-primary transition-colors"
          >
            <Globe className="w-4 h-4" />
            <span>{language === 'en' ? 'العربية' : 'English'}</span>
          </button>

          <div className="hidden md:flex items-center gap-3">
            <Link 
              href="/login"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
            >
              {t.nav.login}
            </Link>
            <Link 
              href="/login"
              className={cn(buttonVariants({ size: "sm" }))}
            >
              {t.nav.cta}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
