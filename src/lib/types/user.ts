export type tUser = {
  _id: string;
  name: string;
  email: string;
  image: string;
  role: tUserRole;
  phone: string;
  bio: string;
  plan: tUserPlan;
  createdAt: Date;
};

export type tUserRole = "student" | "tutor" | "admin";

export type tUserPlan = "free" | "pro";

export type tUserEdit= {
  name: string;
  email: string;
  image: string;
  phone: string;
  bio: string;
}