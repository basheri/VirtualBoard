'use client';

import { useLanguage } from '@/hooks/useLanguage';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import Link from 'next/link';

export function Pricing() {
  const { t } = useLanguage();

  const plans = [
    { key: 'starter', data: t.pricing.starter },
    { key: 'professional', data: t.pricing.professional },
    { key: 'enterprise', data: t.pricing.enterprise },
  ];

  return (
    <section id="pricing" className="py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-heading font-bold text-primary mb-4">
            {t.pricing.title}
          </h2>
          <p className="text-gray-600">
            {t.pricing.subtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map(({ key, data }, index) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`relative bg-white p-8 rounded-2xl border ${key === 'professional'
                ? 'border-primary shadow-xl ring-1 ring-primary/5'
                : 'border-gray-100 hover:shadow-lg'
                } transition-all flex flex-col`}
            >
              {key === 'professional' && 'badge' in data && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                  {String(data.badge)}
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">
                  {data.title}
                </h3>
                <div className="text-4xl font-bold text-primary">
                  {data.price}
                </div>
              </div>

              <ul className="space-y-4 mb-8 flex-1">
                {data.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                    <Check className="w-5 h-5 text-green-500 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link href={key === 'enterprise' ? '#contact' : '/login'} className="block">
                <Button
                  className="w-full"
                  variant={key === 'professional' ? 'default' : 'outline'}
                >
                  {data.cta}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
