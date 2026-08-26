'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { updatePassword } from '@/lib/auth/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Container } from '@/components/layout/container';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    if (password.length < 8) return setError('Password must be at least 8 characters.');
    if (password !== confirmation) return setError('Passwords do not match.');
    setLoading(true);
    const result = await updatePassword(password);
    if (result.success) router.push('/login?message=password-updated');
    else setError(result.error ?? 'Unable to update password.');
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <Container maxWidth="sm">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h1 className="text-2xl font-bold text-[#0a0a0a]">Set a new password</h1>
          <p className="text-gray-600 mt-2 mb-6">Choose a new password for your account.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</p>}
            <Input type="password" placeholder="New password" value={password} onChange={(event) => setPassword(event.target.value)} required />
            <Input type="password" placeholder="Confirm new password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} required />
            <Button type="submit" disabled={loading} className="w-full">{loading ? 'Updating...' : 'Update password'}</Button>
          </form>
          <Link href="/login" className="block text-center text-sm text-gray-600 mt-6">Back to login</Link>
        </div>
      </Container>
    </div>
  );
}