"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Lock,
  GraduationCap,
  BookOpen,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signUp } from "@/lib/auth-client";
import { clearJwtCache } from "@/lib/api";

export default function SignUpPage() {
  const router = useRouter();

  // ফর্মের ডেটা হ্যান্ডেল করার জন্য সাধারণ স্টেট
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student" as "student" | "tutor",
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

    if (!formData.name || !formData.email || !formData.password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      // Better Auth এর signUp.email কল
      const { data, error: authError } = await signUp.email({
        email: formData.email.trim(),
        password: formData.password,
        name: formData.name.trim(),
        image: "",
        callbackURL: "/",
        role: formData.role,
        phone: "",
        bio: "",
        plan: "free",
      });

      if (authError) {
        throw new Error(authError.message || "Failed to sign up.");
      }

      console.log("Sign up successful:", data);

      // নতুন অ্যাকাউন্টের টোকেন নতুন করে আনতে ক্যাশ বাতিল
      clearJwtCache();

      router.push("/");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong during sign up."
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
            <span>Join MentorLagbe</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-heading">
            Create Your Account
          </h1>
          <p className="text-xs sm:text-sm text-body">
            Start your journey as a student or expert mentor today.
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
          {/* Role Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-heading">
              Select Your Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: "student" })}
                className={`flex items-center justify-center gap-2 rounded-2xl border p-3 text-xs font-bold transition-all cursor-pointer ${
                  formData.role === "student"
                    ? "border-brand bg-brand-tint text-heading shadow-xs"
                    : "border-border-subtle bg-surface text-body hover:border-brand/40"
                }`}
              >
                <GraduationCap
                  className={`h-4 w-4 ${
                    formData.role === "student" ? "text-brand" : "text-body"
                  }`}
                />
                Student
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: "tutor" })}
                className={`flex items-center justify-center gap-2 rounded-2xl border p-3 text-xs font-bold transition-all cursor-pointer ${
                  formData.role === "tutor"
                    ? "border-brand bg-brand-tint text-heading shadow-xs"
                    : "border-border-subtle bg-surface text-body hover:border-brand/40"
                }`}
              >
                <BookOpen
                  className={`h-4 w-4 ${
                    formData.role === "tutor" ? "text-brand" : "text-body"
                  }`}
                />
                Tutor / Mentor
              </button>
            </div>
          </div>

          {/* Name Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-heading">
              Full Name
            </label>
            <div className="relative flex items-center">
              <User className="absolute left-3.5 h-4 w-4 text-body pointer-events-none" />
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="h-11 rounded-2xl border-border-subtle bg-surface pl-10 pr-4 text-sm text-heading placeholder:text-body/60 focus-visible:border-brand focus-visible:bg-background focus-visible:ring-brand/20"
              />
            </div>
          </div>

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
            <label className="text-xs font-bold uppercase tracking-wider text-heading">
              Password
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 h-4 w-4 text-body pointer-events-none" />
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
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
            <span>{loading ? "Creating Account..." : "Create Account"}</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>

        {/* Footer Link */}
        <div className="text-center pt-2 border-t border-border-subtle">
          <p className="text-xs text-body">
            Already have an account?{" "}
            <Link
              href="/signin"
              className="font-bold text-heading hover:text-brand transition-colors underline underline-offset-4"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
