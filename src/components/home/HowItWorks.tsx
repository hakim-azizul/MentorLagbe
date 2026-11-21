import React from "react";
import { Search, UserCheck, CalendarCheck, GraduationCap, Sparkles } from "lucide-react";

const steps = [
  {
    step: "01",
    title: "Search & Discover",
    description: "Browse thousands of verified tutors and subject-wise mentorship batches filtered by class level, mode, and budget.",
    icon: Search,
  },
  {
    step: "02",
    title: "Verify & Connect",
    description: "Review tutor qualifications, ratings, and teaching experience before connecting for 1-on-1 sessions or batches.",
    icon: UserCheck,
  },
  {
    step: "03",
    title: "Book or Post Batches",
    description: "Students can easily enroll with secure booking, while skilled tutors can create and manage their custom tuition posts.",
    icon: CalendarCheck,
  },
  {
    step: "04",
    title: "Learn & Grow",
    description: "Attend interactive live online classes or offline home tuitions and track academic progress seamlessly.",
    icon: GraduationCap,
  },
];

export default function HowItWorks() {
  return (
    <section className="relative overflow-hidden border-b border-border-subtle bg-surface py-16 sm:py-24">
      {/* Decorative Blur Effect */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 right-1/4 -z-10 h-72 w-72 rounded-full bg-brand-tint/50 blur-3xl"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand-tint px-3.5 py-1.5 text-xs font-semibold text-heading">
            <Sparkles className="h-3.5 w-3.5 text-brand" />
            <span>A Simple Path to Better Learning</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-heading sm:text-4xl">
            How MentorLagbe Works
          </h2>
          <p className="mt-3 text-base text-body">
            Connect with the right mentor in four simple steps — search, compare, apply, and start learning.
          </p>
        </div>

        {/* 4-Column Workflow Cards Grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <div
                key={index}
                className="group relative flex flex-col rounded-3xl border border-border-subtle bg-background p-8 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-brand/50 hover:shadow-xl hover:shadow-brand/5"
              >
                {/* Step Number & Icon Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-tint text-heading transition-colors group-hover:bg-brand group-hover:text-heading">
                    <IconComponent className="h-7 w-7 text-brand group-hover:text-heading" />
                  </div>
                  <span className="text-2xl font-extrabold text-heading/20 group-hover:text-brand/40 transition-colors">
                    {item.step}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-heading group-hover:text-brand transition-colors mb-2.5">
                  {item.title}
                </h3>

                {/* Description */}
                <p className="text-sm leading-relaxed text-body">
                  {item.description}
                </p>

                {/* Subtle bottom indicator line */}
                <div className="absolute bottom-0 left-8 right-8 h-1 scale-x-0 bg-brand transition-transform duration-300 group-hover:scale-x-100 rounded-full" />
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}