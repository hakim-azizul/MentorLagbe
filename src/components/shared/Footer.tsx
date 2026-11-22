import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin, Heart } from "lucide-react";

// Official Social Media SVG Icons
function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-4 w-4 fill-current"
      {...props}
    >
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-4 w-4 fill-current"
      {...props}
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedInIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-4 w-4 fill-current"
      {...props}
    >
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
  );
}

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-4 w-4 fill-current"
      {...props}
    >
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border-subtle bg-surface text-body">
      <div className="mx-auto max-w-7xl px-4 pt-16 pb-12 sm:px-6 lg:px-8">
        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4 pb-12 border-b border-border-subtle">
          {/* Column 1 & 2: Logo, Tagline, Contact Info & Social Icons */}
          <div className="lg:col-span-2 space-y-5">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-tint p-1.5 transition-transform group-hover:scale-105">
                <Image
                  src="/logo.png"
                  alt="MentorLagbe Logo"
                  width={28}
                  height={28}
                  className="object-contain"
                />
              </div>
              <span className="text-xl font-bold tracking-tight text-heading">
                Mentor<span className="text-brand">Lagbe</span>
              </span>
            </Link>

            <p className="text-sm leading-relaxed max-w-md">
              MentorLagbe is a smart tuition and mentorship platform connecting
              eager learners with verified expert mentors for 1-on-1 guidance
              and live online batches.
            </p>

            <div className="space-y-2.5 text-xs font-medium pt-2">
              <div className="flex items-center gap-2.5 text-body">
                <MapPin className="h-4 w-4 text-brand shrink-0" />
                <span>Cairo, Egypt & Dhaka, Bangladesh</span>
              </div>
              <div className="flex items-center gap-2.5 text-body">
                <Mail className="h-4 w-4 text-brand shrink-0" />
                <a
                  href="mailto:support@mentorlagbe.com"
                  className="hover:text-heading transition-colors"
                >
                  support@mentorlagbe.com
                </a>
              </div>
              <div className="flex items-center gap-2.5 text-body">
                <Phone className="h-4 w-4 text-brand shrink-0" />
                <a
                  href="tel:+8801700000000"
                  className="hover:text-heading transition-colors"
                >
                  +880 1700-000000
                </a>
              </div>
            </div>

            {/* Social Media Links placed nicely right below contact info */}
            <div className="flex items-center space-x-3 pt-2">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-border-subtle bg-background text-body hover:border-brand hover:bg-brand-tint hover:text-heading transition-colors"
              >
                <FacebookIcon />
              </a>
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X (Twitter)"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-border-subtle bg-background text-body hover:border-brand hover:bg-brand-tint hover:text-heading transition-colors"
              >
                <XIcon />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-border-subtle bg-background text-body hover:border-brand hover:bg-brand-tint hover:text-heading transition-colors"
              >
                <LinkedInIcon />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-border-subtle bg-background text-body hover:border-brand hover:bg-brand-tint hover:text-heading transition-colors"
              >
                <InstagramIcon />
              </a>
            </div>
          </div>

          {/* Column 3: Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-heading">
              Quick Links
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href="/tuitions"
                  className="hover:text-brand transition-colors"
                >
                  Find Tutors
                </Link>
              </li>
              <li>
                <Link
                  href="/tuitions"
                  className="hover:text-brand transition-colors"
                >
                  Browse Tuitions
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="hover:text-brand transition-colors"
                >
                  Plans & Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Get Started */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-heading">
              Get Started
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href="/signup"
                  className="hover:text-brand transition-colors"
                >
                  Join as a Student
                </Link>
              </li>
              <li>
                <Link
                  href="/signup"
                  className="hover:text-brand transition-colors"
                >
                  Become a Tutor
                </Link>
              </li>
              <li>
                <Link
                  href="/signin"
                  className="hover:text-brand transition-colors"
                >
                  Sign In
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright Only */}
        <div className="mt-8 text-center sm:text-left">
          <p className="text-xs">
            &copy; {currentYear} MentorLagbe. All rights reserved. Built with{" "}
            <Heart className="inline h-3 w-3 text-red-500 fill-red-500 mx-0.5" />{" "}
            for education.
          </p>
        </div>
      </div>
    </footer>
  );
}
