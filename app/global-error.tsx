'use client';

import { Button } from '@/components/ui/button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="flex h-screen flex-col items-center justify-center space-y-4 text-center">
          <h2 className="text-4xl font-bold">Something went wrong!</h2>
          <p className="text-muted-foreground">An unexpected error occurred.</p>
          <Button onClick={() => reset && reset()}>Try again</Button>
        </div>
      </body>
    </html>
  );
}
