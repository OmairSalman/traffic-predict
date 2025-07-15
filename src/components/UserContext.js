import React, { createContext, useContext, useState, useEffect } from 'react';
import { getToken, storeToken, removeToken, getUserData, storeUserData, removeUserData } from '../services/storageService';
import { api } from '../services/api';
import { syncRoutesWithCloud, clearAllRoutes } from '../storage/routeStorage';

export const UserContext = createContext();
export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      const token = await getToken();
      const userData = await getUserData();
      if (token && userData) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(userData);
      }
      setAuthChecked(true);
    };
    initialize();
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/login', { email, password });
    const { token, user } = response.data;
    await storeToken(token);
    await storeUserData(user);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    await syncRoutesWithCloud();
    setUser(user);
  };

  const register = async (name, email, password) => {
    const response = await api.post('/register', { name, email, password });
    const { token, user } = response.data;
    await storeToken(token);
    await storeUserData(user);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(user);
  };

  const logout = async () => {
    try {
      await api.post('/logout'); // invalidate token on backend
    } catch (err) {
      console.warn('Logout request failed:', err.response?.data || err.message);
    }
    await removeToken();
    await removeUserData();
    await clearAllRoutes();
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };
  

  return (
    <UserContext.Provider value={{ user, login, register, logout, authChecked }}>
      {children}
    </UserContext.Provider>
  );
};