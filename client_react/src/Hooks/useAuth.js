import { useState, useEffect } from 'react';

const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = () => {
    const token = sessionStorage.getItem('access_token');
    const username = sessionStorage.getItem('username') || '';
    setIsLoggedIn(!!token);
    setUsername(username);
  };

  const login = (token, username) => {
    sessionStorage.setItem('access_token', token);
    sessionStorage.setItem('username', username);
    setIsLoggedIn(true);
    setUsername(username);
  };

  const logout = () => {
    sessionStorage.clear();
    setIsLoggedIn(false);
    setUsername('');
  };

  return {
    isLoggedIn,
    username,
    login,
    logout,
    getToken: () => sessionStorage.getItem('access_token') || '',
    getUsername: () => sessionStorage.getItem('username') || '',
  };
};

export default useAuth;