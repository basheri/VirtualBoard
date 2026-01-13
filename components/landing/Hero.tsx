'use client';

import { useLanguage } from '@/hooks/useLanguage';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight, PlayCircle } from 'lucide-react';
import Link from 'next/link';

export function Hero() {
  const { t, dir } = useLanguage();

  return (
    <section className="pt-32 pb-20 overflow-hidden relative">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-linear-to-b from-blue-50/50 to-white -z-10" />
      
      <div className="container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/5 text-primary text-sm font-medium mb-6">
            {t.hero.eyebrow}
          </span>
          
          <h1 className="text-4xl md:text-6xl font-heading font-bold text-primary mb-6 leading-tight">
            {t.hero.headline}
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            {t.hero.subheadline}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link href="/login">
              <Button size="lg" className="h-12 px-8 text-base w-full sm:w-auto">
                {t.hero.primaryCta}
                <ArrowRight className={`w-4 h-4 ${dir === 'rtl' ? 'mr-2 rotate-180' : 'ml-2'}`} />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="h-12 px-8 text-base w-full sm:w-auto">
              <PlayCircle className={`w-4 h-4 ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
              {t.hero.secondaryCta}
            </Button>
          </div>

          <p className="text-sm text-gray-500 font-medium">
            {t.hero.socialProof}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
