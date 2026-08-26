import { getSettings, saveSetting } from '@/actions/admin/settings';
import { Button } from '@/components/ui/button';

export default async function AdminSettingsPage() {
  const settings = await getSettings();
  async function save(formData: FormData) {
    'use server';
    await saveSetting(String(formData.get('key')), String(formData.get('value')));
  }
  return <div className="space-y-5"><div><h2 className="text-2xl font-bold">Settings</h2><p className="text-gray-600 mt-1">Manage key-value store configuration.</p></div><form action={save} className="bg-white rounded-xl border p-5 flex flex-wrap gap-3"><input name="key" placeholder="Setting key" className="h-10 border rounded-md px-3" required /><input name="value" placeholder="Value" className="h-10 border rounded-md px-3 flex-1 min-w-48" required /><Button type="submit">Save setting</Button></form><div className="bg-white rounded-xl border divide-y">{settings.map((setting) => <div key={setting.id} className="p-4 flex justify-between gap-4 text-sm"><span className="font-medium">{setting.key}</span><span className="text-gray-600">{String(setting.value)}</span></div>)}{settings.length === 0 && <p className="p-5 text-gray-600">No settings configured.</p>}</div></div>;
}