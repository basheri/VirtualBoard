import { Pricing } from '@/components/landing/Pricing';

export default function PricingPage() {
  return (
    <div className="py-20">
      <div className="container mx-auto px-6 mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
        <p className="text-xl text-muted-foreground">
          Choose the plan that's right for your business stage.
        </p>
      </div>
      <Pricing />
    </div>
  );
}
