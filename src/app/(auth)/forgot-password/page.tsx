'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { resetPasswordForEmail } from '@/lib/auth/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Container } from '@/components/layout/container';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const channel = typeof window !== 'undefined' && 'BroadcastChannel' in window
      ? new BroadcastChannel('ethio_auth_sync')
      : null;

    const handleSync = (data: { type: string; email?: string }) => {
      if (data.type === 'password-updated' || data.type === 'verified') {
        const p = new URLSearchParams();
        p.set('message', data.type);
        if (data.email) p.set('email', data.email);
        router.replace(`/login?${p.toString()}`);
      }
    };

    if (channel) {
      channel.onmessage = (e) => {
        if (e.data) handleSync(e.data);
      };
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'ethio_auth_event' && e.newValue) {
        try {
          handleSync(JSON.parse(e.newValue));
        } catch {}
      }
    };

    window.addEventListener('storage', handleStorage);

    return () => {
      if (channel) channel.close();
      window.removeEventListener('storage', handleStorage);
    };
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    const result = await resetPasswordForEmail(email);

    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.error || 'Failed to send reset email. Please try again.');
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <Container maxWidth="sm">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#0a0a0a] mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>

          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <div className="h-10 w-10 rounded-lg bg-[#0a0a0a] flex items-center justify-center">
                <span className="text-[#D4AF37] font-black text-lg">E</span>
              </div>
              <span className="font-bold text-[#0a0a0a] text-xl">EthioFashion</span>
            </Link>
            <h1 className="text-2xl font-bold text-[#0a0a0a]">Forgot your password?</h1>
            <p className="text-gray-600 mt-2">
              Enter your email address and we&apos;ll send you a link to reset your password.
            </p>
          </div>

          {success ? (
            <div className="text-center">
              <div className="mb-4 p-4 rounded-lg bg-green-50 border border-green-200">
                <p className="text-green-600 text-sm">
                  Check your email for a password reset link. The link will expire in 1 hour.
                </p>
              </div>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-[#D4AF37] hover:text-[#0a0a0a] font-medium"
              >
                Return to login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-[#0a0a0a] text-white hover:bg-[#1a1a1a]"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Sending reset link...
                  </>
                ) : (
                  'Send reset link'
                )}
              </Button>
            </form>
          )}

          <p className="text-center text-sm text-gray-600 mt-6">
            Remember your password?{' '}
            <Link href="/login" className="text-[#D4AF37] hover:text-[#0a0a0a] font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </Container>
    </div>
  );
}