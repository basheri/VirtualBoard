'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-destructive">حدث خطأ ما</h2>
        <p className="text-muted-foreground max-w-md">
          {error.message || 'عذرًا، حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.'}
        </p>
        <Button onClick={reset} variant="outline">
          إعادة المحاولة
        </Button>
      </div>
    </div>
  );
}