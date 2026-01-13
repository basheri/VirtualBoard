import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { Strategy } from '@/components/landing/Strategy';
import { Testimonials } from '@/components/landing/Testimonials';
import { Pricing } from '@/components/landing/Pricing';
import { CTA } from '@/components/landing/CTA';

export default function LandingPage() {
  return (
    <div className="flex flex-col gap-16 pb-16">
      <Hero />
      <Features />
      <HowItWorks />
      <Strategy />
      <Testimonials />
      <Pricing />
      <CTA />
    </div>
  );
}
