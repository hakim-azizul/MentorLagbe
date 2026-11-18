export type tApplication = {
  _id: string;
  tuitionId: string;
  tuitionTitle: string;
  subject: string;
  monthlyFee: number;
  tutorEmail: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  preferredSchedule: string;
  studentNote?: string;
  status: tStatus;
  appliedAt: Date;
};

export type tStatus = "pending" | "accepted" | "rejected";