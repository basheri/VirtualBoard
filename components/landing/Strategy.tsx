'use client';

import { useLanguage } from '@/hooks/useLanguage';
import { motion } from 'framer-motion';
import { TrendingUp, Shield, Scale } from 'lucide-react';

const icons = {
  growth: TrendingUp,
  safety: Shield,
  balanced: Scale,
};

const colors = {
  growth: 'bg-blue-50 text-blue-600',
  safety: 'bg-indigo-50 text-indigo-600',
  balanced: 'bg-primary/5 text-primary',
};

export function Strategy() {
  const { t } = useLanguage();

  return (
    <section className="py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-heading font-bold text-primary mb-4">
            {t.strategy.title}
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {Object.entries(t.strategy).map(([key, value], index) => {
            if (key === 'title') return null;
            // Type assertion for key as it's definitely one of the strategy keys
            const strategyKey = key as 'growth' | 'safety' | 'balanced';
            const Icon = icons[strategyKey];
            const colorClass = colors[strategyKey];
            const item = value as { title: string; desc: string };

            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-2xl border border-gray-100 text-center hover:shadow-lg transition-all hover:-translate-y-1"
              >
                <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-6 ${colorClass}`}>
                  <Icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-primary mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-600">
                  {item.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
