import { useContext } from 'react';
import { AuthContext } from '../components/common/context/AuthContext';

export const useAuth = () => {
  return useContext(AuthContext);
};
