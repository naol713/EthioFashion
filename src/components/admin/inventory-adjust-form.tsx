'use client';

import { useState, useTransition } from 'react';
import { adjustAdminInventory } from '@/actions/admin/inventory';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface InventoryAdjustFormProps {
  variantId: string;
}

export function InventoryAdjustForm({ variantId }: InventoryAdjustFormProps) {
  const [qty, setQty] = useState('');
  const [note, setNote] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const quantityChange = parseInt(qty, 10);
    if (!qty || isNaN(quantityChange) || quantityChange === 0) {
      setStatus('error');
      setErrorMsg('Enter a non-zero whole number (positive to add, negative to remove).');
      return;
    }
    setStatus('idle');
    setErrorMsg('');
    startTransition(async () => {
      const result = await adjustAdminInventory(variantId, quantityChange, note || undefined);
      if (result.success) {
        setStatus('success');
        setQty('');
        setNote('');
        setTimeout(() => setStatus('idle'), 3000);
      } else {
        setStatus('error');
        setErrorMsg(result.error || 'Failed to adjust inventory.');
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-2">
      <input
        type="number"
        value={qty}
        onChange={(e) => setQty(e.target.value)}
        placeholder="+10 or -3"
        disabled={isPending}
        className="w-24 h-9 border rounded-md px-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
      />
      <input
        type="text"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Reason (optional)"
        disabled={isPending}
        className="w-40 h-9 border rounded-md px-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
      />
      <button
        type="submit"
        disabled={isPending}
        className="h-9 px-3 rounded-md bg-[#0a0a0a] text-white text-sm flex items-center gap-1.5 disabled:opacity-60"
      >
        {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
        Save
      </button>
      {status === 'success' && (
        <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
          <CheckCircle className="h-3.5 w-3.5" /> Updated
        </span>
      )}
      {status === 'error' && (
        <span className="flex items-center gap-1 text-xs text-red-600">
          <AlertCircle className="h-3.5 w-3.5" /> {errorMsg}
        </span>
      )}
    </form>
  );
}
