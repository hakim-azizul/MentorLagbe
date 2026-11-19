"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, LogOut, Sparkles, ArrowRight } from "lucide-react";
import { useSession, authClient } from "@/lib/auth-client";
import { clearJwtCache } from "@/lib/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  dashboardRoutes,
  dashboardTitles,
  roleHome,
} from "@/config/dashboardRoutes";
import type { DashboardUser } from "@/lib/core/dashboardAuth";
import type { tUserRole, tUserPlan } from "@/lib/types/user";

interface DashboardShellProps {
  user: DashboardUser;
  children: React.ReactNode;
}

const VALID_ROLES: tUserRole[] = ["student", "tutor", "admin"];

export default function DashboardShell({
  user,
  children,
}: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  // লাইভ সেশন (রোল/প্ল্যান বদলালে সাইডবারও বদলাবে), সার্ভার প্রপ ফলব্যাক
  const { data: session } = useSession();
  const sessionUser = session?.user;

  const rawRole = (sessionUser?.role ?? user.role) as tUserRole;
  const role: tUserRole = VALID_ROLES.includes(rawRole) ? rawRole : "student";
  const plan = (
    (sessionUser?.plan ?? user.plan) === "pro" ? "pro" : "free"
  ) as tUserPlan;

  const links = dashboardRoutes[role] ?? dashboardRoutes.student;

  const isActive = (href: string) => {
    if (href === roleHome[role]) return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
    } catch (error) {
      console.error("Sign out error:", error);
    }
    // সাইন-আউটে পুরনো JWT মেয়াদ শেষ না হওয়া পর্যন্ত কাজ করা বন্ধ করতে ক্যাশ বাতিল
    clearJwtCache();
    router.push("/");
    router.refresh();
  };

  const identity = {
    name: sessionUser?.name ?? user.name,
    email: sessionUser?.email ?? user.email,
    image: sessionUser?.image ?? user.image,
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "ML";

  const nav = (
    <nav className="flex flex-col gap-1">
      {links.map((link) => {
        const active = isActive(link.href);
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              "group flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-brand-tint text-heading font-semibold shadow-xs"
                : "text-body hover:bg-surface hover:text-heading",
            )}
          >
            <Icon
              className={cn(
                "h-4 w-4 shrink-0 transition-colors",
                active ? "text-brand" : "text-body group-hover:text-brand",
              )}
              aria-hidden="true"
            />
            <span className="truncate">{link.label}</span>
            {active && (
              <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brand" />
            )}
          </Link>
        );
      })}
    </nav>
  );

  const planCard = (
    <div className="rounded-2xl border border-border-subtle bg-surface p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-body">
          Current Plan
        </span>
        <span
          className={cn(
            "rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider",
            plan === "pro"
              ? "bg-brand text-heading"
              : "border border-border-subtle bg-background text-body",
          )}
        >
          {plan}
        </span>
      </div>
      {plan === "free" && (
        <Link
          href="/pricing"
          className="mt-3 flex items-center justify-between gap-2 rounded-xl bg-brand-tint px-3 py-2 text-xs font-semibold text-heading transition-colors hover:bg-brand/20"
        >
          <span className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-brand" />
            Upgrade to Pro
          </span>
          <ArrowRight className="h-3.5 w-3.5 text-brand" />
        </Link>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-surface">
      <div className="flex min-h-screen">
        {/* Desktop Sidebar */}
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col justify-between border-r border-border-subtle bg-background p-4 lg:flex">
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2.5 px-1.5">
              <Image
                src="/logo.png"
                alt="MentorLagbe"
                width={28}
                height={28}
                className="object-contain"
                priority
              />
              <span className="text-lg font-bold tracking-tight text-heading">
                Mentor<span className="text-brand">Lagbe</span>
              </span>
            </Link>
            <div>
              <div className="h-0.5 w-full bg-brand" />
            </div>

            {nav}
            {user?.role !== "admin" && planCard}
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-2xl border border-border-subtle bg-surface p-3">
              <Avatar className="h-9 w-9 border border-border-subtle">
                <AvatarImage
                  src={identity.image || ""}
                  alt={identity.name || "User"}
                />
                <AvatarFallback className="bg-brand-tint text-xs font-bold text-heading">
                  {getInitials(identity.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-heading">
                  {identity.name || "MentorLagbe User"}
                </p>
                <p className="truncate text-xs text-body">{identity.email}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSignOut}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-background px-3 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          </div>
        </aside>

        {/* Main column */}
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-3 border-b border-heading/30 bg-background/90 px-4 backdrop-blur-3xl sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="inline-flex items-center justify-center rounded-lg p-2 text-heading transition-colors hover:bg-surface lg:hidden cursor-pointer"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>

              <Link href="/" className="flex items-center gap-2 lg:hidden">
                <span className="text-base font-bold tracking-tight text-heading">
                  Mentor<span className="text-brand">Lagbe</span>
                </span>
              </Link>

              <p className="hidden text-xl font-bold text-heading lg:block">
                {dashboardTitles[role]}
              </p>
            </div>
            {user?.role !== "admin" && (
              <div>
                <span
                  className={cn(
                    "hidden rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider sm:inline-block",
                    plan === "pro"
                      ? "bg-brand text-heading"
                      : "border border-border-subtle bg-surface text-body",
                  )}
                >
                  {plan} plan
                </span>
              </div>
            )}
          </header>
          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute inset-y-0 left-0 flex w-72 max-w-[85%] flex-col justify-between border-r border-border-subtle bg-background p-4">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Link
                  href="/"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2"
                >
                  <Image
                    src="/logo.png"
                    alt="MentorLagbe"
                    width={26}
                    height={26}
                  />
                  <span className="text-base font-bold text-heading">
                    Mentor<span className="text-brand">Lagbe</span>
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg p-2 text-heading hover:bg-surface cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-border-subtle bg-surface p-3">
                <Avatar className="h-9 w-9 border border-border-subtle">
                  <AvatarImage
                    src={identity.image || ""}
                    alt={identity.name || "User"}
                  />
                  <AvatarFallback className="bg-brand-tint text-xs font-bold text-heading">
                    {getInitials(identity.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-heading">
                    {identity.name || "MentorLagbe User"}
                  </p>
                  <p className="truncate text-xs text-body">{identity.email}</p>
                </div>
              </div>

              {nav}
              {user?.role !== "admin" && planCard}
            </div>

            <button
              type="button"
              onClick={handleSignOut}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-background px-3 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
