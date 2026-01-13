'use client';

import { useLanguage } from '@/hooks/useLanguage';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function CTA() {
  const { t } = useLanguage();

  return (
    <section className="py-24 bg-primary text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6">
          {t.cta.headline}
        </h2>
        <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
          {t.cta.subtext}
        </p>
        <div className="flex flex-col items-center gap-4">
          <Link href="/login">
            <Button size="lg" variant="secondary" className="h-12 px-8 text-base font-bold text-primary">
              {t.cta.button}
            </Button>
          </Link>
          <p className="text-sm text-blue-200">
            {t.cta.secondary}
          </p>
        </div>
      </div>
    </section>
  );
}
