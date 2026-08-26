import { getCurrentUser } from '@/lib/auth';
import { Header } from './header';

/**
 * Server component — fetches the current user's role and passes
 * isAdmin to the Header client component. This keeps Header
 * fully client-side while allowing server-side role detection.
 */
export async function HeaderWrapper() {
  let isAdmin = false;

  try {
    const user = await getCurrentUser();
    isAdmin = user?.role === 'ADMIN';
  } catch {
    // Not logged in or DB unavailable — default to false
  }

  return <Header isAdmin={isAdmin} />;
}
