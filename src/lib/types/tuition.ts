import type { tUserPlan } from "./user";

export type tTuition = {
  _id: string;
  title: string;
  subject: string;
  classLevel: string;
  mode: tmode;
  location?: string;
  monthlyFee: number;
  daysPerWeek: number;
  bannerImage: string;
  description: string;
  tutorName: string;
  tutorEmail: string;
  approvalStatus: tapprovalStatus;
  isActive: boolean;
  createdAt: Date;
};

export type tapprovalStatus = "pending" | "approved" | "rejected";

export type tmode = "Online" | "Offline" | "Hybrid";

export type tTuitionView = {
  _id: string;
  title: string;
  subject: string;
  classLevel: string;
  mode: tmode;
  location?: string;
  monthlyFee: number;
  daysPerWeek: number;
  bannerImage: string;
  description: string;
  tutorName: string;
  tutorEmail: string;
  createdAt: Date;
};

/** টিউশনার প্রোফাইল সামারি — GET /api/tuitions/:id থেকে populate হয়। */
export type tTutorProfile = {
  name: string;
  email: string;
  image: string;
  bio: string;
  plan: tUserPlan;
};

/** পাবলিক টিউশন ডিটেইলস পেজের payload (ফুল ডকুমেন্ট + টিউশনার সামারি)। */
export type tTuitionDetails = tTuition & {
  tutor: tTutorProfile;
};