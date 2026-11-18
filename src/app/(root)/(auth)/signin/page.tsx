"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, ArrowRight, Eye, EyeOff, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signIn } from "@/lib/auth-client";

export default function LoginPage() {
  const router = useRouter();

  // লগইন ফর্মের স্টেট
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ইনপুট পরিবর্তনের হ্যান্ডলার
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // সাধারণ ভ্যালিডেশন
    if (!formData.email || !formData.password) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);

    try {
      // Better Auth এর signIn.email কল করা হচ্ছে
      const { data, error: authError } = await signIn.email({
        email: formData.email.trim(),
        password: formData.password,
        callbackURL: "/", // সফলভাবে লগইন হওয়ার পর যেখানে রিডাইরেক্ট হবে
      });

      if (authError) {
        throw new Error(authError.message || "Invalid email or password.");
      }

      console.log("Sign in successful:", data);

      router.push("/");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong during sign in."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-[calc(100vh-80px)] items-center justify-center bg-surface py-12 px-4 sm:px-6 lg:px-8">
      {/* Decorative Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-10 right-10 -z-10 h-72 w-72 rounded-full bg-brand-tint/60 blur-3xl"
      />

      <div className="w-full max-w-md space-y-7 rounded-3xl border border-border-subtle bg-background p-8 shadow-xl shadow-heading/5">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-brand/30 bg-brand-tint px-3 py-1 text-xs font-semibold text-heading">
            <Sparkles className="h-3.5 w-3.5 text-brand" />
            <span>Welcome Back</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-heading">
            Sign In to Account
          </h1>
          <p className="text-xs sm:text-sm text-body">
            Access your student dashboard or mentorship portal.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-center text-xs font-medium text-red-600">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-heading">
              Email Address
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3.5 h-4 w-4 text-body pointer-events-none" />
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                className="h-11 rounded-2xl border-border-subtle bg-surface pl-10 pr-4 text-sm text-heading placeholder:text-body/60 focus-visible:border-brand focus-visible:bg-background focus-visible:ring-brand/20"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-heading">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-body hover:text-brand transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 h-4 w-4 text-body pointer-events-none" />
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="h-11 rounded-2xl border-border-subtle bg-surface pl-10 pr-10 text-sm text-heading placeholder:text-body/60 focus-visible:border-brand focus-visible:bg-background focus-visible:ring-brand/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 text-body hover:text-heading cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-brand hover:bg-brand-hover text-heading font-bold py-6 rounded-2xl shadow-sm transition-all gap-2 cursor-pointer text-sm"
          >
            <span>{loading ? "Signing In..." : "Sign In"}</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>

        {/* Footer Link to Sign Up */}
        <div className="text-center pt-2 border-t border-border-subtle">
          <p className="text-xs text-body">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-bold text-heading hover:text-brand transition-colors underline underline-offset-4"
            >
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
