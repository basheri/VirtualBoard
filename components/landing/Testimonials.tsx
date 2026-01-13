'use client';

import { useLanguage } from '@/hooks/useLanguage';
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';

export function Testimonials() {
  const { t } = useLanguage();

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-heading font-bold text-primary mb-4">
            {t.testimonials.title}
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {t.testimonials.items.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-gray-50 p-8 rounded-2xl relative"
            >
              <Quote className="w-8 h-8 text-primary/10 absolute top-8 left-8" />
              <p className="text-gray-600 mb-8 relative z-10 leading-relaxed italic">
                &quot;{item.quote}&quot;
              </p>
              <div>
                <h4 className="font-bold text-primary">
                  {item.name}
                </h4>
                <p className="text-sm text-gray-500">
                  {item.title}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
