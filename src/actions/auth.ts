"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient, hasSupabaseConfig } from "@/lib/supabase/server";
import { prisma } from "@/lib/db/prisma";

// User roles (aligned with Prisma schema)
type UserRole = "CUSTOMER" | "ADMIN";

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export async function register(payload: RegisterPayload) {
  if (!hasSupabaseConfig()) {
    return { success: false, error: "Supabase is not configured yet." };
  }

  try {
    const supabase = await createClient();

    // Check if user already exists
    const { data: existingUser } = await supabase.auth.getUser();
    if (existingUser.user) {
      // Already logged in
      return { success: true, user: existingUser.user };
    }

    // Sign up the user with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: payload.email,
      password: payload.password,
      options: {
        data: {
          first_name: payload.firstName,
          last_name: payload.lastName,
          phone: payload.phone,
        },
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data.user) {
      return {
        success: false,
        error: "Registration failed. Please try again.",
      };
    }

    // Create profile in database if it doesn't exist
    // Note: If email confirmation is required, the session will be null here
    if (data.session) {
      try {
        // Check if profile already exists (might happen on race conditions or if trigger exists)
        const existingProfile = await prisma.profiles.findUnique({
          where: { user_id: data.user.id },
        });

        if (!existingProfile) {
          await prisma.profiles.create({
            data: {
              user_id: data.user.id,
              first_name: payload.firstName,
              last_name: payload.lastName,
              phone: payload.phone || null,
            },
          });
        }
      } catch (profileError) {
        // If profile creation fails, log it but don't fail the registration
        // The profile might be created by a database trigger or on first login
        console.error("Failed to create profile:", profileError);
      }
    }

    // Check if email confirmation is required
    if (data.user && !data.session) {
      return {
        success: true,
        user: data.user,
        needsConfirmation: true,
      };
    }

    return {
      success: true,
      user: data.user,
      session: data.session,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Registration failed.",
    };
  }
}

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const redirectTo = (formData.get("redirectTo") as string) || "/account";

  if (!hasSupabaseConfig()) {
    return { success: false, error: "Supabase is not configured yet." };
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

    // Ensure profile exists on login
    if (data.user) {
      try {
        const existingProfile = await prisma.profiles.findUnique({
          where: { user_id: data.user.id },
        });

        if (!existingProfile) {
          // Get user metadata from auth
          const metadata = data.user.user_metadata || {};

          await prisma.profiles.create({
            data: {
              user_id: data.user.id,
              first_name: (metadata.first_name as string) || "",
              last_name: (metadata.last_name as string) || "",
              phone: (metadata.phone as string) || null,
            },
          });
        }
      } catch (profileError) {
        console.error("Failed to ensure profile exists:", profileError);
      }
    }

    revalidatePath("/", "layout");
    return { success: true, redirectTo };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Login failed.",
    };
  }
}

export async function logout() {
  if (!hasSupabaseConfig()) {
    redirect("/");
  }

  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch (error) {
    console.error("Sign out error:", error);
  }

  revalidatePath("/", "layout");
  redirect("/");
}
