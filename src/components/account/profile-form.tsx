'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateProfile } from '@/actions/profile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function ProfileForm({
  user,
}: {
  user: { firstName: string; lastName: string; phone?: string };
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone ?? '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    const result = await updateProfile(form);
    if (result.success) {
      setMessage('Profile updated successfully.');
      router.refresh();
    } else {
      setError(result.error ?? 'Unable to update profile.');
    }
    setLoading(false);
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <h1 className="text-2xl font-bold text-[#0a0a0a]">Profile</h1>
      <p className="text-gray-600 mt-1 mb-6">Update your personal information.</p>
      <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
        {message && <p className="p-3 rounded-lg bg-green-50 text-green-700 text-sm">{message}</p>}
        {error && <p className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</p>}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input aria-label="First name" placeholder="First name" value={form.firstName} onChange={(event) => setForm({ ...form, firstName: event.target.value })} required />
          <Input aria-label="Last name" placeholder="Last name" value={form.lastName} onChange={(event) => setForm({ ...form, lastName: event.target.value })} required />
        </div>
        <Input aria-label="Phone" type="tel" placeholder="+251XXXXXXXXX" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
        <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save changes'}</Button>
      </form>
    </div>
  );
}