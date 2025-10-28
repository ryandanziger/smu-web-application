import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on app load
    const savedUser = localStorage.getItem('smu_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (role, username, userData = null) => {
    // If userData is provided (from API), use it; otherwise create mock data for demo
    const finalUserData = userData || {
      role,
      username,
      id: Date.now(), // Simple ID generation for demo
      loginTime: new Date().toISOString()
    };
    
    setUser(finalUserData);
    localStorage.setItem('smu_user', JSON.stringify(finalUserData));
    return finalUserData;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('smu_user');
  };

  const value = {
    user,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
