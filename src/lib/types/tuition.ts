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

/** টিউশনার প্রোফাইল সামারি — GET /api/tuitions ও GET /api/tuitions/:id দুটোই populate করে। */
export type tTutorProfile = {
  name: string;
  email: string;
  image: string;
  bio: string;
  plan: tUserPlan;
};

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
  /** টিউশনার প্রোফাইল সামারি — কার্ডের অ্যাভাটার/নাম রেন্ডার করে। */
  tutor: tTutorProfile;
  createdAt: Date;
};

/** পাবলিক টিউশন ডিটেইলস পেজের payload (ফুল ডকুমেন্ট + টিউশনার সামারি)। */
export type tTuitionDetails = tTuition & {
  tutor: tTutorProfile;
};

/** GET /api/tuitions?page=&limit= — ফিল্টার করা কোয়েরির pagination মেটাডেটা। */
export type tTuitionPagination = {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

/** `?meta=1` রেসপন্স — আইটেম + pagination একসাথে। */
export type tTuitionPage = tTuitionPagination & {
  items: tTuitionView[];
};

/** fetchTuitions()-এর ফিল্টার/পেজিনেশন অপশন। */
export type tTuitionQuery = {
  page?: number;
  limit?: number;
  search?: string;
  subject?: string;
  classLevel?: string;
  mode?: string;
  sort?: string;
};