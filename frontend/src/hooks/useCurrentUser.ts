import { useAuth } from '@/contexts/AuthContext';

const useCurrentUser = () => {
  const { user, isLoading, isAuthenticated } = useAuth();
  
  return { 
    user, 
    isLoading, 
    isAuthenticated 
  };
};

export default useCurrentUser;
