import { Navigate } from "react-router";
import { getCurrentUser, isAuthenticated, UserRole } from "../lib/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  const user = getCurrentUser();
  
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect to their respective dashboard or home if they don't have access
    const roleRoutes: Record<UserRole, string> = {
      admin: "/admin",
      recycling_center: "/recycling-center",
      collector: "/collector",
      user: "/user",
      guest: "/guest",
    };
    
    return <Navigate to={roleRoutes[user.role] || "/"} replace />;
  }

  return <>{children}</>;
}
