import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { User } from '@/lib/supabase';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Array<User['role']>;
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  // If user is not authenticated, redirect to login page
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // If allowedRoles are specified and the user's role is not in the list, redirect
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect to home page as a safe fallback for unauthorized access
    return <Navigate to="/" replace />;
  }


  // If user is authenticated and has the correct role, render the children
  return <>{children}</>;
}