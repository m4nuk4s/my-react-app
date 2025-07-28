import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface PublicRouteProps {
  children: React.ReactNode;
  restricted?: boolean;
}

export default function PublicRoute({ children, restricted = false }: PublicRouteProps) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const from = location.state?.from || '/';

  // If user is authenticated and the route is restricted (like login page),
  // redirect to the home page or the page they were trying to access
  if (isAuthenticated && restricted) {
    return <Navigate to={from} replace />;
  }

  // Otherwise, render the public component
  return <>{children}</>;
}