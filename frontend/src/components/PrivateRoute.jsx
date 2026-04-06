import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PrivateRoute({ children, adminOnly = false }) {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  if (adminOnly && (!currentUser.roles || !currentUser.roles.includes('ROLE_ADMIN'))) {
    return <Navigate to="/" />; // Redirect unprivileged users
  }

  return children;
}
