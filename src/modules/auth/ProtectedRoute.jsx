import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

// Component to protect routes that require authentication
export default function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth();

  // If still loading auth state, don't render anything yet
  if (loading) {
    return <div>Loading...</div>;
  }

  // If not authenticated, redirect to login
  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  // If authenticated, render the protected component
  return children;
}
