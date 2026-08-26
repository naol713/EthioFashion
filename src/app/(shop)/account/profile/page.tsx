import { getCurrentUser } from '@/lib/auth';
import { ProfileForm } from '@/components/account/profile-form';

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) return null;

  return <ProfileForm user={user} />;
}