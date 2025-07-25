import { useAuth } from '@/contexts/AuthContext';
import Auth from './Auth';
import Dashboard from './Dashboard';

const Index = () => {
  const { currentUser } = useAuth();
  
  return currentUser ? <Dashboard /> : <Auth />;
};

export default Index;
