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

export type tmode = "Online" | "Offline";

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