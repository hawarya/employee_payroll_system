import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // Add auth header to all axios instances
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Parse user from localStorage
        const storedUser = JSON.parse(localStorage.getItem('user'));
        
        if (decoded.exp * 1000 < Date.now()) {
            logout();
        } else {
            setCurrentUser(storedUser);
        }
      } catch (e) {
        logout();
      }
    }
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          logout();
        }
        return Promise.reject(error);
      }
    );

    setLoading(false);

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  const login = async (employeeId, password) => {
    const res = await axios.post('/api/auth/login', { employeeId, password });
    if (res.data.token) {
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data));
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      setCurrentUser(res.data);
    }
    return res.data;
  };

  const signup = async (employeeId, name, password) => {
    return await axios.post('/api/auth/signup', { employeeId, name, password });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    login,
    signup,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
