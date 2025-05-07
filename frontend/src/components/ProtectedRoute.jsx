import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/userAuthContext';

const ProtectedRoute = ({ children }) => {
  const { currentUser, authLoading, isAuthenticated } = useAuth();
  
  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-t-4 border-green-500 border-t-transparent"></div>
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Render children if authenticated
  return children;
};

export default ProtectedRoute;