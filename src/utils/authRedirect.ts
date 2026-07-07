import { all_routes } from "../feature-module/router/all_routes";

/**
 * Role ID mapping:
 * 1 = School Admin
 * 2 = Teacher
 * 3 = Student
 * 4 = Super Admin
 */

export const ROLE = {
  SCHOOL_ADMIN: 1,
  TEACHER:      2,
  STUDENT:      3,
  SUPER_ADMIN:  4,
} as const;

/** Roles that are NEVER subject to the subscription / is_active check */
export const SUBSCRIPTION_EXEMPT_ROLES = [ROLE.TEACHER, ROLE.STUDENT, ROLE.SUPER_ADMIN];

/**
 * Returns the correct post-login redirect path.
 * Only School Admin (role 1) is gated by is_active.
 */
export function getPostLoginRedirect(roleId: number, isActive: boolean): string {
  switch (roleId) {
    case ROLE.SCHOOL_ADMIN:
      return isActive ? all_routes.adminDashboard : "/payment";
    case ROLE.TEACHER:
      return all_routes.teacherDashboard;
    case ROLE.STUDENT:
      return all_routes.studentDashboard;
    case ROLE.SUPER_ADMIN:
      return all_routes.superadminDashboard;
    default:
      return all_routes.login;
  }
}

/**
 * Reads role_id and is_active from localStorage and returns the redirect path.
 * is_active is ONLY evaluated for School Admin (role 1).
 * Teachers, Students, and Super Admins are never blocked by is_active.
 */
export function handlePostLoginRedirect(): string {
  const roleId = Number(localStorage.getItem("role_id") || 0);
  const isActive = localStorage.getItem("is_active") === "true";
  return getPostLoginRedirect(roleId, isActive);
}

/**
 * Returns true only when the payment banner should be shown:
 * School Admin (role 1) with is_active === false.
 */
export function shouldShowPaymentBanner(): boolean {
  const roleId = Number(localStorage.getItem("role_id") || 0);
  const isActive = localStorage.getItem("is_active") === "true";
  return roleId === ROLE.SCHOOL_ADMIN && !isActive;
}
