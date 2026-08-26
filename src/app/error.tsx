'use client';

import { useEffect } from 'react';
import { captureException } from '@/lib/monitoring';

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { captureException(error); }, [error]);
  return <main className="min-h-screen flex items-center justify-center p-8 text-center"><div><h1 className="text-2xl font-bold">Something went wrong</h1><p className="mt-2 text-gray-600">Please try again.</p><button onClick={() => reset()} className="mt-5 rounded-md bg-[#0a0a0a] px-4 py-2 text-white">Try again</button></div></main>;
}