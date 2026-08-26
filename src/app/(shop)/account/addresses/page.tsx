import { redirect } from 'next/navigation';
import { createAddress, deleteAddress, getAddresses, setDefaultAddress } from '@/actions/addresses';
import { ETHIOPIAN_REGIONS } from '@/config/ethiopia';
import { getCurrentUser } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AddressesPageProps {
  searchParams?: Promise<{
    saved?: string;
    error?: string;
  }>;
}

export default async function AddressesPage({ searchParams }: AddressesPageProps) {
  const user = await getCurrentUser();
  if (!user) redirect('/login?redirect=/account/addresses');

  const resolvedSearchParams = (searchParams ? await searchParams : {}) as {
    saved?: string;
    error?: string;
  };
  const result = await getAddresses();

  async function handleCreate(formData: FormData) {
    'use server';
    const createResult = await createAddress({
      fullName: String(formData.get('fullName') ?? ''),
      phone: String(formData.get('phone') ?? ''),
      region: String(formData.get('region') ?? ''),
      city: String(formData.get('city') ?? ''),
      subCity: String(formData.get('subCity') ?? ''),
      woreda: String(formData.get('woreda') ?? ''),
      streetAddress: String(formData.get('streetAddress') ?? ''),
      building: String(formData.get('building') ?? ''),
      additionalInfo: String(formData.get('additionalInfo') ?? ''),
      label: String(formData.get('label') ?? ''),
      isDefault: formData.get('isDefault') === 'on',
    });

    if (createResult.success) {
      redirect('/account/addresses?saved=1');
    }

    const message = createResult.error || 'Failed to save address';
    redirect(`/account/addresses?error=${encodeURIComponent(message)}`);
  }

  async function handleDelete(formData: FormData) {
    'use server';
    await deleteAddress(String(formData.get('id')));
  }

  async function handleDefault(formData: FormData) {
    'use server';
    await setDefaultAddress(String(formData.get('id')));
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-[#0a0a0a]">Delivery addresses</h1>
        <p className="text-gray-600 mt-1 mb-6">Save Ethiopia-specific delivery details for faster checkout.</p>
        {resolvedSearchParams.saved && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            Address saved successfully.
          </div>
        )}
        {resolvedSearchParams.error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {resolvedSearchParams.error}
          </div>
        )}
        <form action={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input name="fullName" placeholder="Recipient name" required />
          <Input name="phone" placeholder="+251XXXXXXXXX" required />
          <select name="region" required className="h-10 rounded-md border border-gray-300 px-3 text-sm">
            <option value="">Select region</option>
            {ETHIOPIAN_REGIONS.map((region) => <option key={region}>{region}</option>)}
          </select>
          <Input name="city" placeholder="City" required />
          <Input name="subCity" placeholder="Sub-city" />
          <Input name="woreda" placeholder="Woreda" />
          <Input name="streetAddress" placeholder="Street address" required />
          <Input name="building" placeholder="Building or house number" />
          <Input name="label" placeholder="Label, e.g. Home or Office" />
          <Input name="additionalInfo" placeholder="Additional delivery instructions" />
          <label className="sm:col-span-2 flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" name="isDefault" /> Make this my default address
          </label>
          <Button type="submit" className="sm:col-span-2 w-fit">Add address</Button>
        </form>
      </div>

      <div className="space-y-4">
        {result.addresses.map((address) => (
          <div key={address.id} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex flex-wrap justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold">{address.label || 'Delivery address'}</h2>
                  {address.is_default && <span className="text-xs rounded-full bg-green-100 text-green-700 px-2 py-1">Default</span>}
                </div>
                <p className="mt-2">{address.recipient_name} · {address.phone}</p>
                <p className="text-sm text-gray-600">{address.street_address}, {address.building || ''} {address.city}, {address.sub_city || ''} {address.region}</p>
                {address.woreda && <p className="text-sm text-gray-600">Woreda: {address.woreda}</p>}
                {address.additional_info && <p className="text-sm text-gray-500 mt-1">{address.additional_info}</p>}
              </div>
              <div className="flex items-start gap-3">
                {!address.is_default && <form action={handleDefault}><input type="hidden" name="id" value={address.id} /><Button type="submit" variant="outline" size="sm">Make default</Button></form>}
                <form action={handleDelete}><input type="hidden" name="id" value={address.id} /><Button type="submit" variant="outline" size="sm">Delete</Button></form>
              </div>
            </div>
          </div>
        ))}
        {result.addresses.length === 0 && <p className="text-gray-600">No saved addresses yet.</p>}
      </div>
    </div>
  );
}
