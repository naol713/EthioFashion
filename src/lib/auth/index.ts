import { createClient, hasSupabaseConfig } from "@/lib/supabase/server";
import { prisma } from "@/lib/db/prisma";
import { cookies } from "next/headers";

// User roles (aligned with Prisma schema)
type UserRole = "CUSTOMER" | "ADMIN";

export interface SessionUser {
  id: string;
  email: string;
  role: UserRole;
  profileId: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
}

// Get current authenticated user
export async function getCurrentUser(): Promise<SessionUser | null> {
  if (!hasSupabaseConfig()) {
    console.log("[auth] No Supabase config");
    return null;
  }

  try {
    const supabase = await createClient();

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      console.log("[auth] getUser error:", error.message);
    }
    if (!user) {
      console.log("[auth] No user returned from getUser");
      return null;
    }

    console.log("[auth] User found:", user.id, user.email);

    // Get user metadata from Supabase Auth as fallback
    const metadata = user.user_metadata || {};

    // Try to fetch profile from database using Prisma
    let profile = null;
    let role: UserRole = "CUSTOMER";

    try {
      profile = await prisma.profiles.findUnique({
        where: { user_id: user.id },
      });

      // Try to get user role if profile exists
      if (profile) {
        const userRole = await prisma.user_roles.findFirst({
          where: { user_id: user.id },
        });
        if (userRole) {
          role = userRole.role as UserRole;
        }
      }
    } catch (dbError) {
      // Database might not be connected, continue with auth metadata
      console.warn("Database not available, using auth metadata only");
    }

    // If no profile in DB, use Supabase auth metadata
    if (!profile) {
      console.log("[auth] No profile found, using auth metadata");
      return {
        id: user.id,
        email: user.email!,
        role: "CUSTOMER",
        profileId: user.id, // Use user.id as fallback profileId
        firstName: (metadata.first_name as string) || "",
        lastName: (metadata.last_name as string) || "",
        phone: (metadata.phone as string) || undefined,
        avatarUrl: undefined,
      };
    }

    console.log("[auth] Profile found, returning user");
    return {
      id: user.id,
      email: user.email!,
      role,
      profileId: profile.id,
      firstName: profile.first_name,
      lastName: profile.last_name,
      phone: profile.phone || undefined,
      avatarUrl: profile.avatar_url || undefined,
    };
  } catch (err) {
    console.error("getCurrentUser error:", err);
    return null;
  }
}

// Check if user is authenticated
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null;
}

// Check if user has a specific role
export async function hasRole(role: UserRole): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === role;
}

// Check if user is an admin
export async function isAdmin(): Promise<boolean> {
  return hasRole("ADMIN");
}

// Require authentication (throw if not authenticated)
export async function requireAuth(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

// Require specific role (throw if not authorized)
export async function requireRole(role: UserRole): Promise<SessionUser> {
  const user = await requireAuth();
  if (user.role !== role) {
    throw new Error("FORBIDDEN");
  }
  return user;
}

// Require admin (throw if not admin)
export async function requireAdmin(): Promise<SessionUser> {
  return requireRole("ADMIN");
}

// Sign in with email and password
export async function signIn(email: string, password: string) {
  if (!hasSupabaseConfig()) {
    return { success: false, error: 'Supabase is not configured yet.' };
  }

  try {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, user: data.user, session: data.session };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Supabase configuration error.' };
  }
}

// Sign up with email and password
export async function signUp(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  phone?: string
) {
  if (!hasSupabaseConfig()) {
    return { success: false, error: 'Supabase is not configured yet.' };
  }

  try {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          phone,
        },
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, user: data.user, session: data.session };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Supabase configuration error.' };
  }
}

// Sign out
export async function signOut() {
  if (!hasSupabaseConfig()) {
    return { success: true };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Supabase configuration error.' };
  }
}

// Reset password (send reset email)
export async function resetPassword(email: string) {
  if (!hasSupabaseConfig()) {
    return { success: false, error: 'Supabase is not configured yet.' };
  }

  try {
    const supabase = await createClient();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Supabase configuration error.' };
  }
}

// Update password (after reset)
export async function updatePassword(newPassword: string) {
  if (!hasSupabaseConfig()) {
    return { success: false, error: 'Supabase is not configured yet.' };
  }

  try {
    const supabase = await createClient();

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Supabase configuration error.' };
  }
}

// Get session
export async function getSession() {
  if (!hasSupabaseConfig()) {
    return { success: false, error: 'Supabase is not configured yet.', session: null };
  }

  try {
    const supabase = await createClient();
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      return { success: false, error: error.message, session: null };
    }

    return { success: true, session };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Supabase configuration error.', session: null };
  }
}