// The account of the person signed in, exactly as GET /api/auth/me returns it.
// Two separate axes of rights: role is the job, is_admin is the tool's admin.
export type StaffMember = {
  id: number;
  full_name: string;
  email: string;
  role: 'keeper' | 'veterinarian';
  is_admin: boolean;
};
