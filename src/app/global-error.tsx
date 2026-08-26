'use client';

import { useEffect } from 'react';
import { captureException } from '@/lib/monitoring';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { captureException(error); }, [error]);
  return <html lang="en"><body><main style={{ padding: 32, fontFamily: 'Arial, sans-serif' }}><h1>Something went wrong</h1><p>We could not load this page.</p><button onClick={() => reset()}>Try again</button></main></body></html>;
}