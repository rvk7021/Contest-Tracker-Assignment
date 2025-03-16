import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children }) => {
  const { user } = useSelector((state) => state.profile);
 
  
  return user ? children : <Navigate to="/sign-in" />;
};

export default ProtectedRoute;
