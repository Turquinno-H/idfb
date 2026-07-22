export interface AuthenticatedUser {
  userId: string;
  email: string;
  isSuperAdmin: boolean;
  companyId: string | null;
  companyMemberId: string | null;
  permissions: string[];
}

export interface AccessTokenPayload {
  sub: string;
  email: string;
  companyId: string | null;
  companyMemberId: string | null;
  permissions: string[];
  isSuperAdmin: boolean;
}
