export type StaffRole = "admin" | "sub-admin" | "editor";

/** Shape returned by /api/auth/admin-session. */
export type AdminSessionUser = {
  id: string;
  email: string;
  name?: string;
  role: StaffRole;
  permissions: string[];
};
