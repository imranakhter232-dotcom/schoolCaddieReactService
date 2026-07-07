import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { SUBSCRIPTION_EXEMPT_ROLES } from "../utils/authRedirect";

// Routes accessible even when school admin account is inactive
const INACTIVE_ALLOWED = ["/payment", "/payment-success", "/profile"];

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { token: contextToken, isActive, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  // Teacher/student logins write directly to localStorage, bypassing AuthContext
  const token = contextToken || localStorage.getItem("token");

  // Not logged in → go to login
  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const roleId = Number(localStorage.getItem("role_id") || 0);

  // Teacher, Student, Super Admin are never gated by subscription
  const exemptFromSubscription = SUBSCRIPTION_EXEMPT_ROLES.includes(roleId);

  // Only School Admin (role 1) can be redirected to /payment
  if (!exemptFromSubscription && !isActive && !INACTIVE_ALLOWED.includes(location.pathname)) {
    return <Navigate to="/payment" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
