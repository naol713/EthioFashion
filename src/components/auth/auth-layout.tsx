"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { register, login } from "@/actions/auth";
import { signInWithGoogle } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";

type AuthMode = "login" | "register";

export function AuthLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<AuthMode>(
    pathname?.includes("/register") ? "register" : "login",
  );

  // Login form state — email pre-filled if present in URL query, password ALWAYS empty
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Register form state — ALWAYS initialized to empty strings
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [registerShowPassword, setRegisterShowPassword] = useState(false);
  const [registerError, setRegisterError] = useState("");
  const [registerLoading, setRegisterLoading] = useState(false);

  const emailSentMessage = searchParams.get("message") === "check-email";
  const verifiedMessage = searchParams.get("message") === "verified";
  const passwordUpdatedMessage =
    searchParams.get("message") === "password-updated";

  useEffect(() => {
    if (pathname?.includes("/register")) {
      setMode("register");
      // Reset register form state so it is always clean and empty
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
      });
    } else if (pathname?.includes("/login")) {
      setMode("login");
    }
  }, [pathname]);

  useEffect(() => {
    const messageFromQuery = searchParams.get("message");
    const emailFromQuery = searchParams.get("email");

    if (
      messageFromQuery === "check-email" ||
      messageFromQuery === "verified" ||
      messageFromQuery === "password-updated"
    ) {
      setMode("login");
    }

    if (emailFromQuery) {
      setEmail(emailFromQuery);
    } else {
      setEmail("");
    }

    // Security requirement: Password must NEVER be pre-filled automatically
    setPassword("");

    // Setup cross-tab sync channel
    const channel =
      typeof window !== "undefined" && "BroadcastChannel" in window
        ? new BroadcastChannel("ethio_auth_sync")
        : null;

    if (
      (messageFromQuery === "verified" ||
        messageFromQuery === "password-updated") &&
      channel
    ) {
      channel.postMessage({
        type: messageFromQuery,
        email: emailFromQuery || "",
      });
      try {
        localStorage.setItem(
          "ethio_auth_event",
          JSON.stringify({
            type: messageFromQuery,
            email: emailFromQuery || "",
            t: Date.now(),
          }),
        );
      } catch {}
    }

    const handleSync = (data: { type: string; email?: string }) => {
      if (data.type === "verified" || data.type === "password-updated") {
        const p = new URLSearchParams();
        p.set("message", data.type);
        if (data.email) p.set("email", data.email);
        router.replace(`/login?${p.toString()}`);
      }
    };

    if (channel) {
      channel.onmessage = (e) => {
        if (e.data) handleSync(e.data);
      };
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "ethio_auth_event" && e.newValue) {
        try {
          handleSync(JSON.parse(e.newValue));
        } catch {}
      }
    };

    window.addEventListener("storage", handleStorage);

    // Force clear any browser autofill values on load
    const timer = setTimeout(() => {
      const pwdInput = document.getElementById(
        "password",
      ) as HTMLInputElement | null;
      if (pwdInput) {
        pwdInput.value = "";
      }
    }, 50);

    return () => {
      clearTimeout(timer);
      if (channel) channel.close();
      window.removeEventListener("storage", handleStorage);
    };
  }, [searchParams, router]);

  async function handleLoginSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    const result = await login(formData);

    if (result.success) {
      const redirectPath = new URLSearchParams(window.location.search).get(
        "redirect",
      );
      let destination = "/account";
      if (redirectPath?.startsWith("/") && !redirectPath.startsWith("//")) {
        destination = redirectPath;
      } else {
        try {
          const roleRes = await fetch("/api/auth/me");
          if (roleRes.ok) {
            const data = await roleRes.json();
            if (data.role === "ADMIN") {
              destination = "/admin";
            }
          }
        } catch {
          // fallback to /account
        }
      }
      router.push(destination);
      router.refresh();
    } else {
      setError(result.error || "Login failed. Please try again.");
    }

    setLoading(false);
  }

  async function handleGoogleSignIn() {
    setError("");
    setGoogleLoading(true);

    const redirectPath = new URLSearchParams(window.location.search).get(
      "redirect",
    );
    const result = await signInWithGoogle(redirectPath || "/account");

    if (!result.success) {
      setError(result.error || "Google sign-in failed. Please try again.");
      setGoogleLoading(false);
    }
  }

  function handleRegisterChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleRegisterSubmit(e: React.FormEvent) {
    e.preventDefault();
    setRegisterError("");

    if (formData.password !== formData.confirmPassword) {
      setRegisterError("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      setRegisterError("Password must be at least 8 characters");
      return;
    }

    setRegisterLoading(true);

    const result = await register({
      email: formData.email,
      password: formData.password,
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
    });

    if (result.success) {
      const registeredEmail = formData.email;
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
      });

      const params = new URLSearchParams();
      if (result.needsConfirmation) {
        params.set("message", "check-email");
      }
      if (registeredEmail) {
        params.set("email", registeredEmail);
      }
      router.replace(
        params.toString() ? `/login?${params.toString()}` : "/login",
      );
      router.refresh();
    } else {
      setRegisterError(
        result.error || "Registration failed. Please try again.",
      );
    }

    setRegisterLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 sm:p-6 lg:p-8">
      <div
        className={`auth-container relative isolate h-[100dvh] w-full overflow-hidden bg-gray-50 transition-[height] duration-500 ease-in-out sm:max-h-[calc(100dvh-4rem)] sm:max-w-5xl sm:rounded-2xl sm:border sm:border-gray-200 sm:shadow-2xl ${
          mode === "login" ? "sm:h-[34rem]" : "sm:h-[44rem]"
        }`}
      >
        <div className="relative z-0 grid h-full w-full grid-cols-2">
          {/* Left Side - Login Form */}
          <div
            aria-hidden={mode !== "login"}
            inert={mode !== "login"}
            className={`flex h-full items-center justify-center overflow-y-auto px-3 py-6 transition-[opacity,transform] duration-500 ease-in-out sm:p-8 ${
              mode === "login"
                ? "pointer-events-auto opacity-100"
                : "pointer-events-none opacity-0"
            }`}
            style={{
              transform:
                mode === "login"
                  ? "perspective(1000px) rotateY(0deg)"
                  : "perspective(1000px) rotateY(-8deg)",
            }}
          >
            <div className="max-w-md w-full">
              <div className="text-center mb-8">
                <Link href="/" className="inline-flex items-center gap-2 mb-6">
                  <div className="h-10 w-10 rounded-lg bg-[#D4AF37] flex items-center justify-center">
                    <span className="text-[#0a0a0a] font-black text-lg">E</span>
                  </div>
                  <span className="font-bold text-[#0a0a0a] text-xl">
                    EthioFashion
                  </span>
                </Link>
                <h1 className="text-2xl font-bold text-[#0a0a0a]">
                  Welcome back
                </h1>
                <p className="text-gray-600 mt-2">
                  Sign in to your account to continue
                </p>
              </div>

              <form
                onSubmit={handleLoginSubmit}
                autoComplete="off"
                className="space-y-4"
              >
                {emailSentMessage && (
                  <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
                    Your account was created! Please check your email to verify
                    your account, then sign in with your email and password.
                  </div>
                )}
                {verifiedMessage && (
                  <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                    Email verified successfully! Please enter your password to
                    sign in.
                  </div>
                )}
                {passwordUpdatedMessage && (
                  <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                    Password updated successfully! Please sign in with your new
                    password.
                  </div>
                )}
                {error && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="text-sm font-medium text-gray-700"
                  >
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="off"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="text-sm font-medium text-gray-700"
                    >
                      Password
                    </label>
                    <Link
                      href="/forgot-password"
                      className="text-sm text-[#D4AF37] hover:text-[#0a0a0a] transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="new-password"
                      required
                      disabled={loading}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#0a0a0a] text-white hover:bg-[#1a1a1a]"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Signing in...
                    </>
                  ) : (
                    "Sign in"
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-gray-300 bg-white text-gray-900 hover:bg-gray-50"
                  disabled={loading || googleLoading}
                  onClick={handleGoogleSignIn}
                >
                  {googleLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Continuing with Google...
                    </>
                  ) : (
                    <>
                      <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white">
                        <svg
                          viewBox="0 0 24 24"
                          className="h-5 w-5"
                          aria-hidden="true"
                        >
                          <path
                            fill="#4285F4"
                            d="M21.35 11.1h-9.18v2.95h5.28c-.23 1.39-1.05 2.57-2.22 3.36v2.79h3.58c2.1-1.94 3.31-4.8 3.31-8.2 0-.76-.07-1.5-.2-2.2Z"
                          />
                          <path
                            fill="#34A853"
                            d="M12.17 22c2.97 0 5.47-.98 7.3-2.68l-3.58-2.79c-.99.66-2.25 1.04-3.72 1.04-2.86 0-5.28-1.93-6.15-4.53H2.34v2.86A11 11 0 0 0 12.17 22Z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M6.02 13.04a6.6 6.6 0 0 1 0-4.08V6.1H2.34a11 11 0 0 0 0 9.8l3.68-2.86Z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12.17 4.38c1.62 0 3.08.56 4.23 1.66l3.17-3.17A10.6 10.6 0 0 0 12.17 0 11 11 0 0 0 2.34 6.1l3.68 2.86c.87-2.6 3.29-4.58 6.15-4.58Z"
                          />
                        </svg>
                      </span>
                      Continue with Google
                    </>
                  )}
                </Button>
              </form>

              <p className="text-center text-sm text-gray-600 mt-6">
                Don&apos;t have an account?{" "}
                <button
                  onClick={() => setMode("register")}
                  className="text-[#D4AF37] hover:text-[#0a0a0a] font-medium transition-colors"
                >
                  Create one
                </button>
              </p>
            </div>
          </div>

          {/* Right Side - Registration Form */}
          <div
            aria-hidden={mode !== "register"}
            inert={mode !== "register"}
            className={`flex h-full items-start justify-center overflow-y-auto px-3 py-6 transition-[opacity,transform] duration-500 ease-in-out sm:px-8 sm:py-4 ${
              mode === "register"
                ? "pointer-events-auto opacity-100"
                : "pointer-events-none opacity-0"
            }`}
            style={{
              transform:
                mode === "register"
                  ? "perspective(1000px) rotateY(0deg)"
                  : "perspective(1000px) rotateY(8deg)",
            }}
          >
            <div className="max-w-md w-full">
              <div className="text-center mb-8">
                <Link href="/" className="inline-flex items-center gap-2 mb-6">
                  <div className="h-10 w-10 rounded-lg bg-[#D4AF37] flex items-center justify-center">
                    <span className="text-[#0a0a0a] font-black text-lg">E</span>
                  </div>
                  <span className="font-bold text-[#0a0a0a] text-xl">
                    EthioFashion
                  </span>
                </Link>
                <h1 className="text-2xl font-bold text-[#0a0a0a]">
                  Create your account
                </h1>
                <p className="text-gray-600 mt-2">
                  Join thousands of fashion lovers
                </p>
              </div>

              <form
                onSubmit={handleRegisterSubmit}
                autoComplete="off"
                className="space-y-4"
              >
                {registerError && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                    {registerError}
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label
                      htmlFor="firstName"
                      className="text-sm font-medium text-gray-700"
                    >
                      First name
                    </label>
                    <Input
                      id="firstName"
                      name="firstName"
                      placeholder="Naol"
                      value={formData.firstName}
                      onChange={handleRegisterChange}
                      autoComplete="given-name"
                      required
                      disabled={registerLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="lastName"
                      className="text-sm font-medium text-gray-700"
                    >
                      Last name
                    </label>
                    <Input
                      id="lastName"
                      name="lastName"
                      placeholder="Rebo"
                      value={formData.lastName}
                      onChange={handleRegisterChange}
                      autoComplete="family-name"
                      required
                      disabled={registerLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="reg-email"
                    className="text-sm font-medium text-gray-700"
                  >
                    Email
                  </label>
                  <Input
                    id="reg-email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleRegisterChange}
                    autoComplete="off"
                    required
                    disabled={registerLoading}
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="phone"
                    className="text-sm font-medium text-gray-700"
                  >
                    Phone (Ethiopia)
                  </label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+251 91 234 5678"
                    value={formData.phone}
                    onChange={handleRegisterChange}
                    autoComplete="tel"
                    disabled={registerLoading}
                  />
                  <p className="text-xs text-gray-500">
                    For order updates via SMS
                  </p>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="reg-password"
                    className="text-sm font-medium text-gray-700"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      id="reg-password"
                      name="password"
                      type={registerShowPassword ? "text" : "password"}
                      placeholder="At least 8 characters"
                      value={formData.password}
                      onChange={handleRegisterChange}
                      autoComplete="new-password"
                      required
                      disabled={registerLoading}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setRegisterShowPassword(!registerShowPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {registerShowPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="confirmPassword"
                    className="text-sm font-medium text-gray-700"
                  >
                    Confirm password
                  </label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleRegisterChange}
                    autoComplete="new-password"
                    required
                    disabled={registerLoading}
                  />
                </div>

                <p className="text-xs text-gray-500">
                  By creating an account, you agree to our Terms of Service and
                  Privacy Policy.
                </p>

                <Button
                  type="submit"
                  className="w-full bg-[#0a0a0a] text-[#ffffff] hover:bg-[#1a1a1a]"
                  disabled={registerLoading}
                >
                  {registerLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Creating account...
                    </>
                  ) : (
                    "Create account"
                  )}
                </Button>
              </form>

              <p className="text-center text-sm text-gray-600 mt-6">
                Already have an account?{" "}
                <button
                  onClick={() => setMode("login")}
                  className="text-[#D4AF37] hover:text-[#0a0a0a] font-medium transition-colors"
                >
                  Sign in
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* Auth overlay */}
        <div
          className="absolute inset-y-0 right-0 z-10 flex w-1/2 items-center justify-center overflow-hidden bg-[#0a0a0a] p-4 text-center text-white transition-[clip-path,transform] duration-500 ease-in-out sm:p-8"
          style={{
            clipPath:
              mode === "login"
                ? "polygon(14% 0, 100% 0, 100% 100%, 0 100%)"
                : "polygon(0 0, 86% 0, 100% 100%, 0 100%)",
            transform: mode === "login" ? "translateX(0)" : "translateX(-100%)",
          }}
        >
          <div className="absolute inset-0 pointer-events-none">
            <Image
              src="/EthioFashion.png"
              alt="EthioFashion"
              fill
              priority
              sizes="(max-width: 640px) 100vw, 50vw"
              className="object-cover object-center opacity-65"
            />
          </div>

          <div className="absolute inset-0 bg-[#0a0a0a]/45" />

          <div className="relative z-10 flex h-full w-full flex-col items-center justify-center text-center">
            <div className="max-w-xs">
              <p className="mb-2 text-base font-bold sm:mb-3 sm:text-2xl">
                {mode === "login"
                  ? "New to EthioFashion?"
                  : "Already a member?"}
              </p>
              <p className="mb-4 text-xs leading-5 text-gray-300 sm:mb-7 sm:text-sm sm:leading-6">
                {mode === "login"
                  ? "Create an account and discover fashion made for you."
                  : "Sign back in and pick up where you left off."}
              </p>
              <button
                type="button"
                onClick={() => setMode(mode === "login" ? "register" : "login")}
                className="rounded-full border border-white/70 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-white hover:text-[#0a0a0a] sm:px-7 sm:py-2.5 sm:text-sm"
              >
                {mode === "login" ? "Create account" : "Sign in"}
              </button>
              <Link
                href="/"
                className="mt-5 inline-flex items-center gap-1 rounded-full border border-white/70 bg-white/8 px-4 py-2 text-xs font-medium text-white shadow-[0_0_18px_rgba(255,255,255,0.22)] transition-all hover:bg-white hover:text-[#0a0a0a] hover:shadow-[0_0_24px_rgba(255,255,255,0.35)] sm:px-5 sm:py-2.5"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
