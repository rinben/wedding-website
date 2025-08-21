import React, { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Check for an existing token on initial load
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      setUser({ isLoggedIn: true, token });
    }
  }, []);

  const login = (token) => {
    localStorage.setItem("access_token", token);
    setUser({ isLoggedIn: true, token });
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
