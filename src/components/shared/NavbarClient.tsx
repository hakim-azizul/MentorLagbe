"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  X,
  LayoutDashboard,
  User,
  LogOut,
  BookOpen,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { authClient } from "@/lib/auth-client";
import { clearJwtCache } from "@/lib/api";

interface NavbarUser {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: "student" | "tutor" | "admin" | string;
}

interface NavbarClientProps {
  user: NavbarUser | null;
}

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Find Tutors", href: "/tutors" },
  { name: "Tuition Batches", href: "/batches" },
  { name: "Become a Tutor", href: "/become-tutor" },
];

export default function NavbarClient({ user }: NavbarClientProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const { error } = await authClient.signOut();
      if (error) {
        console.error("Sign out error:", error.message);
      }
    } catch (error) {
      console.error("Sign out error:", error);
    }
    // সাইন-আউটে পুরনো JWT মেয়াদ শেষ না হওয়া পর্যন্ত কাজ করা বন্ধ করতে ক্যাশ বাতিল
    clearJwtCache();
    router.push("/");
    router.refresh();
  };

  const getInitials = (name?: string | null) => {
    if (!name) return "ML";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border-subtle bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl transition-transform group-hover:scale-105">
            <Image
              src="/logo.png"
              alt="MentorLagbe Logo"
              width={28}
              height={28}
              className="object-contain"
              priority
            />
          </div>
          <span className="text-xl font-bold tracking-tight text-heading">
            Mentor<span className="text-brand">Lagbe</span>
          </span>
        </Link>

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-brand-tint text-heading font-semibold"
                    : "text-body hover:bg-surface hover:text-heading"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Right: Auth Actions / User Profile */}
        <div className="hidden md:flex items-center gap-3">
          {!user ? (
            <>
              <Link href="/signin">
                <Button
                  variant="ghost"
                  className="text-body hover:text-heading hover:bg-surface font-medium cursor-pointer"
                >
                  Log in
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-brand hover:bg-brand-hover text-heading font-semibold shadow-xs transition-all cursor-pointer">
                  Get Started
                </Button>
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/dashboard">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-border-subtle text-heading hover:bg-brand-tint hover:border-brand/40 gap-2 cursor-pointer"
                >
                  <LayoutDashboard className="h-4 w-4 text-brand" />
                  Dashboard
                </Button>
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 rounded-full border border-border-subtle bg-surface p-1 pr-2.5 transition hover:border-brand/50 focus:outline-none cursor-pointer">
                  <Avatar className="h-8 w-8 border border-border-subtle">
                    <AvatarImage
                      src={user.image || ""}
                      alt={user.name || "User"}
                    />
                    <AvatarFallback className="bg-brand-tint text-heading text-xs font-bold">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="max-w-25 truncate text-sm font-medium text-heading">
                    {user.name?.split(" ")[0] || "Account"}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-body" />
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  className="w-56 border-border-subtle bg-background p-1.5 shadow-lg"
                >
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="px-2 py-1.5">
                      <p className="text-sm font-semibold text-heading truncate">
                        {user.name || "MentorLagbe User"}
                      </p>
                      <p className="text-xs font-normal text-body truncate">
                        {user.email}
                      </p>
                      {user.role && (
                        <span className="mt-1 inline-block rounded-md bg-brand-tint px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-heading">
                          {user.role}
                        </span>
                      )}
                    </DropdownMenuLabel>
                  </DropdownMenuGroup>

                  <DropdownMenuSeparator className="bg-border-subtle" />

                  <DropdownMenuItem className="cursor-pointer focus:bg-surface">
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2 text-heading"
                    >
                      <LayoutDashboard className="h-4 w-4 text-body" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem className="cursor-pointer focus:bg-surface">
                    <Link
                      href="/dashboard/profile"
                      className="flex items-center gap-2 text-heading"
                    >
                      <User className="h-4 w-4 text-body" />
                      My Profile
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem className="cursor-pointer focus:bg-surface">
                    <Link
                      href="/dashboard/enrollments"
                      className="flex items-center gap-2 text-heading"
                    >
                      <BookOpen className="h-4 w-4 text-body" />
                      My Tuitions
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="bg-border-subtle" />

                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-600 flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="inline-flex items-center justify-center rounded-lg p-2 text-heading hover:bg-surface md:hidden"
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Dropdown Drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-border-subtle bg-background px-4 pt-3 pb-5 md:hidden">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`rounded-lg px-3 py-2.5 text-sm font-medium ${
                    isActive
                      ? "bg-brand-tint text-heading font-semibold"
                      : "text-body hover:bg-surface hover:text-heading"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          <div className="mt-4 border-t border-border-subtle pt-4">
            {!user ? (
              <div className="flex flex-col gap-2">
                <Link href="/signin" onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    variant="outline"
                    className="w-full border-border-subtle text-heading hover:bg-surface"
                  >
                    Log in
                  </Button>
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button className="w-full bg-brand hover:bg-brand-hover text-heading font-semibold">
                    Get Started
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-3 rounded-xl bg-surface p-3 border border-border-subtle">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={user.image || ""}
                      alt={user.name || "User"}
                    />
                    <AvatarFallback className="bg-brand-tint text-heading font-bold">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="overflow-hidden">
                    <p className="truncate text-sm font-semibold text-heading">
                      {user.name}
                    </p>
                    <p className="truncate text-xs text-body">{user.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button
                      variant="outline"
                      className="w-full border-border-subtle text-heading gap-1.5"
                    >
                      <LayoutDashboard className="h-4 w-4 text-brand" />
                      Dashboard
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    onClick={handleLogout}
                    className="w-full border-red-200 text-red-600 hover:bg-red-50 gap-1.5"
                  >
                    <LogOut className="h-4 w-4" />
                    Log out
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
