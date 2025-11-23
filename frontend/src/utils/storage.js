// Storage utility for tab-specific sessions
// Uses sessionStorage instead of localStorage so each tab has independent login state

export const storage = {
  getItem: (key) => {
    return sessionStorage.getItem(key);
  },
  
  setItem: (key, value) => {
    return sessionStorage.setItem(key, value);
  },
  
  removeItem: (key) => {
    return sessionStorage.removeItem(key);
  },
  
  clear: () => {
    return sessionStorage.clear();
  }
};

// Helper functions for auth specifically
export const getToken = () => storage.getItem('token');
export const setToken = (token) => storage.setItem('token', token);
export const removeToken = () => storage.removeItem('token');

export const getUser = () => {
  const user = storage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const setUser = (user) => {
  storage.setItem('user', JSON.stringify(user));
};

export const removeUser = () => storage.removeItem('user');
