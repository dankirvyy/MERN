import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx'; // Make sure to import the context itself

// This is the *only* thing in this file
export function useAuth() {
  return useContext(AuthContext);
}