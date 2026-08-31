import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const redirectPath = requestUrl.searchParams.get("redirect");

  if (!code) {
    return NextResponse.redirect(new URL("/login", requestUrl.origin));
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(new URL("/login?error=oauth", requestUrl.origin));
    }

    const userEmail = data.user?.email || "";
    const safeRedirect =
      redirectPath && redirectPath.startsWith("/") && !redirectPath.startsWith("//")
        ? redirectPath
        : userEmail
          ? `/login?message=verified&email=${encodeURIComponent(userEmail)}`
          : "/account";

    return NextResponse.redirect(new URL(safeRedirect, requestUrl.origin));
  } catch {
    return NextResponse.redirect(new URL("/login?error=oauth", requestUrl.origin));
  }
}
