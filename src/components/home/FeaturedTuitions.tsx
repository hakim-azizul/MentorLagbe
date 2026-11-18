import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  Video,
  Calendar,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { tTuitionView } from "@/lib/types/tuition";

export type tmode = "Online" | "Offline";

interface FeaturedTuitionsProps {
  tuitions?: tTuitionView[];
}

// ৩টি ডামি ডেটা (API ইন্টিগ্রেট করার আগে প্রিভিউ দেখার জন্য)
const dummyTuitions: tTuitionView[] = [
  {
    _id: "1",
    title: "HSC Advanced Physics & Higher Math Care Batch",
    subject: "Physics & Math",
    classLevel: "HSC 2nd Year",
    mode: "Online",
    monthlyFee: 2500,
    daysPerWeek: 3,
    bannerImage: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80",
    description: "Comprehensive problem-solving and concept clearing sessions for HSC candidates.",
    tutorName: "Tanvir Ahmed",
    tutorEmail: "tanvir@example.com",
    createdAt: new Date(),
  },
  {
    _id: "2",
    title: "Class 10 General Math & Science Home Tuition",
    subject: "General Science",
    classLevel: "SSC Class 10",
    mode: "Offline",
    location: "Dhanmondi, Dhaka",
    monthlyFee: 4000,
    daysPerWeek: 4,
    bannerImage: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&auto=format&fit=crop&q=80",
    description: "Dedicated 1-on-1 home tutoring focused on board exam preparation and weekly tests.",
    tutorName: "Sadia Sultana",
    tutorEmail: "sadia@example.com",
    createdAt: new Date(),
  },
  {
    _id: "3",
    title: "Complete Full-Stack Web Development Mentorship",
    subject: "Programming",
    classLevel: "University / Beginners",
    mode: "Online",
    monthlyFee: 3500,
    daysPerWeek: 2,
    bannerImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80",
    description: "Learn Next.js, Node.js, MongoDB, and build real-world production ready projects.",
    tutorName: "Azizul Hakim",
    tutorEmail: "hakim@example.com",
    createdAt: new Date(),
  },
];

export default function FeaturedTuitions({
  tuitions = dummyTuitions,
}: FeaturedTuitionsProps) {
  return (
    <section className="bg-surface py-16 sm:py-24 border-b border-border-subtle">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand-tint px-3.5 py-1.5 text-xs font-semibold text-heading mb-3">
              <Sparkles className="h-3.5 w-3.5 text-brand" />
              <span>Verified Listings</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-heading sm:text-4xl">
              Featured Tuition & Mentorship Batches
            </h2>
            <p className="mt-2 text-base text-body max-w-2xl">
              Explore the latest approved and active tuition listings from verified expert mentors and tutors.
            </p>
          </div>
          <Link href="/tuitions">
            <Button
              variant="outline"
              className="border-border-subtle bg-background hover:bg-brand-tint hover:border-brand/40 text-heading font-semibold gap-2 cursor-pointer shrink-0"
            >
              Browse All Tuitions
              <ArrowRight className="h-4 w-4 text-brand" />
            </Button>
          </Link>
        </div>

        {/* Tuitions Grid (Equal Height & Width Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tuitions.map((item) => (
            <div
              key={item._id}
              className="group flex flex-col justify-between rounded-3xl border border-border-subtle bg-background overflow-hidden shadow-xs transition-all duration-300 hover:shadow-xl hover:border-brand/40"
            >
              {/* Card Top: Banner Image & Badges */}
              <div>
                <div className="relative h-48 w-full overflow-hidden bg-surface">
                  <Image
                    src={item.bannerImage}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Mode Badge (Online / Offline) */}
                  <div className="absolute top-3 left-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-bold shadow-sm ${
                        item.mode === "Online"
                          ? "bg-brand text-heading"
                          : "bg-heading text-background"
                      }`}
                    >
                      {item.mode === "Online" ? (
                        <Video className="h-3.5 w-3.5" />
                      ) : (
                        <MapPin className="h-3.5 w-3.5 text-brand" />
                      )}
                      {item.mode}
                    </span>
                  </div>

                  {/* Class Level Badge */}
                  <div className="absolute top-3 right-3">
                    <span className="rounded-lg bg-background/90 backdrop-blur-md px-2.5 py-1 text-xs font-semibold text-heading shadow-xs">
                      {item.classLevel}
                    </span>
                  </div>
                </div>

                {/* Card Body Info */}
                <div className="p-6 space-y-3">
                  <div className="flex items-center justify-between text-xs font-medium text-body">
                    <span className="text-brand font-semibold uppercase tracking-wider">
                      {item.subject}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-body" />
                      {item.daysPerWeek} days/week
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-heading line-clamp-2 group-hover:text-brand transition-colors">
                    {item.title}
                  </h3>

                  {/* Location or Mode Details */}
                  {item.mode === "Offline" && item.location && (
                    <p className="flex items-center gap-1.5 text-xs text-body">
                      <MapPin className="h-3.5 w-3.5 text-brand shrink-0" />
                      <span className="truncate">{item.location}</span>
                    </p>
                  )}

                  {/* Description */}
                  <p className="text-sm text-body line-clamp-2">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Card Footer: Tutor Info, Price & View Details Button */}
              <div className="p-6 pt-0 mt-auto space-y-4">
                <div className="border-t border-border-subtle pt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-tint text-heading font-bold text-xs border border-brand/20">
                      {item.tutorName.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs font-medium text-body">Tutor</p>
                      <p className="text-sm font-semibold text-heading truncate max-w-30">
                        {item.tutorName}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-body block">Monthly Fee</span>
                    <span className="text-base font-extrabold text-heading">
                      ৳{item.monthlyFee.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* View Details Button */}
                <Link href={`/tuitions/${item._id}`} className="block">
                  <Button className="w-full bg-brand hover:bg-brand-hover text-heading font-semibold py-5 rounded-xl shadow-xs transition-all cursor-pointer">
                    View Details
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}