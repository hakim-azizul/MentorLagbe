import type { tUserPlan } from "./user";

/** GET /api/dashboard/student/stats */
export type StudentStats = {
  totalApplied: number;
  acceptedCount: number;
  pendingCount: number;
  plan: tUserPlan;
};

/** GET /api/dashboard/tutor/stats */
export type TutorStats = {
  totalPosted: number;
  approvedCount: number;
  totalApplicants: number;
  plan: tUserPlan;
};

/** GET /api/dashboard/admin/stats */
export type AdminStats = {
  totalUsers: number;
  totalTutors: number;
  pendingTuitions: number;
  approvedTuitions: number;
  totalRevenue: number;
};
