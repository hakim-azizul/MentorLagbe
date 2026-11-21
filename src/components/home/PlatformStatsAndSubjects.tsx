import React from "react";
import Link from "next/link";
import {
  Calculator,
  Atom,
  Code2,
  Globe,
  BookOpen,
  Users,
  Award,
  CheckCircle2,
  Star,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

// ১. পপুলার সাবজেক্ট ক্যাটাগরি ডেটা
const popularSubjects = [
  {
    name: "Higher Mathematics",
    slug: "Math",
    description: "Calculus, Algebra, Trigonometry & Board exam preparation",
    count: "450+ Tutors",
    icon: Calculator,
    color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  },
  {
    name: "Physics & Science",
    slug: "Physics",
    description: "Mechanics, Electricity, Chemistry & Lab guidance",
    count: "380+ Tutors",
    icon: Atom,
    color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400",
  },
  {
    name: "Programming & Web",
    slug: "Programming",
    description: "JavaScript, Next.js, Python, Full-Stack & Logic",
    count: "290+ Mentors",
    icon: Code2,
    color: "bg-purple-500/10 text-purple-600 border-purple-500/20 dark:text-purple-400",
  },
  {
    name: "IELTS & English",
    slug: "IELTS",
    description: "Spoken English, Band 8+ Strategy & Grammar",
    count: "210+ Experts",
    icon: Globe,
    color: "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400",
  },
];

// ২. প্ল্যাটফর্ম স্ট্যাটিস্টিক্স কাউন্টার
const stats = [
  { label: "Verified Tutors & Mentors", value: "1,200+", icon: Users },
  {
    label: "Active Students Enrolled",
    value: "8,500+",
    icon: GraduationCapIcon,
  },
  { label: "Completed Tutoring Hours", value: "45,000+", icon: TrendingUp },
  { label: "Success & Satisfaction Rate", value: "99.4%", icon: Award },
];

// ৩. স্টুডেন্ট ও টিউটর ফিডব্যাক / টেস্টোনিয়াল কার্ড
const testimonials = [
  {
    quote:
      "MentorLagbe helped me find an incredible BUETian physics tutor right in Dhanmondi. My exam grades improved drastically within 2 months!",
    name: "Ayman Sadiq",
    role: "HSC 2nd Year Student",
    rating: 5,
  },
  {
    quote:
      "As a full-stack mentor, managing my online programming batches and student enrollments has never been this smooth. Highly recommended platform!",
    name: "Tanvir Ahmed",
    role: "Verified Pro Mentor",
    rating: 5,
  },
  {
    quote:
      "The payment system and verified badge feature give parents total peace of mind. Finding a trusted home tutor took less than 10 minutes.",
    name: "Dr. Farhana Sultana",
    role: "Parent, Dhaka",
    rating: 5,
  },
];

function GraduationCapIcon(props: React.SVGProps<SVGSVGElement>) {
  return <BookOpen {...props} />;
}

export default function PlatformStatsAndSubjects() {
  return (
    <section className="relative overflow-hidden border-b border-border-subtle bg-background py-16 sm:py-24">
      {/* Decorative Glow Background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-10 left-10 -z-10 h-80 w-80 rounded-full bg-brand-tint/60 blur-3xl"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* --- PART 1: Platform Statistics Counters --- */}
        <div className="mb-20 rounded-3xl border border-border-subtle bg-surface p-8 sm:p-12 shadow-sm">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {stats.map((stat, idx) => {
              const IconComponent = stat.icon;
              return (
                <div key={idx} className="flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-tint text-heading">
                    <IconComponent className="h-7 w-7 text-brand" />
                  </div>
                  <div>
                    <p className="text-2xl sm:text-3xl font-extrabold text-heading">
                      {stat.value}
                    </p>
                    <p className="text-xs sm:text-sm font-medium text-body">
                      {stat.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* --- PART 2: Top Subject Categories --- */}
        <div className="mb-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand-tint px-3.5 py-1.5 text-xs font-semibold text-heading">
                <Sparkles className="h-3.5 w-3.5 text-brand" />
                <span>Explore Disciplines</span>
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-heading sm:text-4xl">
                Top Subject Categories
              </h2>
              <p className="mt-2 text-base text-body max-w-xl">
                Find specialized academic guidance and professional mentorship
                across high-demand subjects.
              </p>
            </div>
            <Link
              href="/tuitions"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-heading hover:text-brand transition-colors"
            >
              View all subjects
              <ArrowRight className="h-4 w-4 text-brand" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {popularSubjects.map((sub, idx) => {
              const IconComponent = sub.icon;
              return (
                <Link
                  key={idx}
                  href={`/tuitions?search=${encodeURIComponent(sub.slug)}`}
                  className="group flex flex-col justify-between rounded-3xl border border-border-subtle bg-surface p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand hover:bg-background hover:shadow-xl hover:shadow-brand/5"
                >
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${sub.color}`}
                      >
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <span className="rounded-full bg-brand-tint px-3 py-1 text-xs font-semibold text-heading">
                        {sub.count}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-heading group-hover:text-brand transition-colors mb-2">
                      {sub.name}
                    </h3>
                    <p className="text-xs leading-relaxed text-body">
                      {sub.description}
                    </p>
                  </div>

                  <div className="mt-6 flex items-center gap-1 text-xs font-bold text-heading group-hover:text-brand pt-4 border-t border-border-subtle">
                    <span>Explore Batches</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* --- PART 3: Testimonials & Feedback Cards --- */}
        <div>
          <div className="mx-auto max-w-2xl text-center mb-12">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand-tint px-3.5 py-1.5 text-xs font-semibold text-heading">
              <CheckCircle2 className="h-3.5 w-3.5 text-brand" />
              <span>Community Trust</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-heading sm:text-4xl">
              Trusted by Students & Mentors
            </h2>
            <p className="mt-3 text-base text-body">
              Hear what our community members have to say about their experience
              with MentorLagbe.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {testimonials.map((item, idx) => (
              <div
                key={idx}
                className="flex flex-col justify-between rounded-3xl border border-border-subtle bg-surface p-8 shadow-xs transition-all duration-300 hover:border-brand/40 hover:shadow-lg"
              >
                <div>
                  {/* Star Ratings */}
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-brand text-brand" />
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="text-sm leading-relaxed text-body italic">
                    &ldquo;{item.quote}&rdquo;
                  </p>
                </div>

                {/* Author Info */}
                <div className="mt-8 flex items-center gap-3 pt-4 border-t border-border-subtle">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-heading font-bold text-sm">
                    {item.name[0]}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-heading">
                      {item.name}
                    </h3>
                    <p className="text-xs text-body">{item.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
