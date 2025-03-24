import { createContext } from 'react';

// Create a context for user authentication state
export const UserContext = createContext({
  user: null,
  login: () => {},
  logout: () => {}
});