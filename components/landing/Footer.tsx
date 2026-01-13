'use client';

import { useLanguage } from '@/hooks/useLanguage';
import Link from 'next/link';

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-gray-900 text-gray-300 py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-primary rounded-sm transform rotate-45" />
              </div>
              <span className="font-heading font-bold text-xl text-white">
                VirtualBoard AI
              </span>
            </Link>
            <p className="text-sm text-gray-400">
              {t.footer.tagline}
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white mb-6">{t.footer.product}</h4>
            <ul className="space-y-4 text-sm">
              <li><Link href="/#features" className="hover:text-white transition-colors">{t.footer.links.features}</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition-colors">{t.footer.links.pricing}</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">{t.footer.links.demo}</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">{t.footer.links.changelog}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-6">{t.footer.company}</h4>
            <ul className="space-y-4 text-sm">
              <li><Link href="/about" className="hover:text-white transition-colors">{t.footer.links.about}</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">{t.footer.links.blog}</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">{t.footer.links.careers}</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">{t.footer.links.contact}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-6">{t.footer.legal}</h4>
            <ul className="space-y-4 text-sm">
              <li><Link href="/privacy" className="hover:text-white transition-colors">{t.footer.links.privacy}</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">{t.footer.links.terms}</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">{t.footer.links.security}</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
          {t.footer.rights}
        </div>
      </div>
    </footer>
  );
}
