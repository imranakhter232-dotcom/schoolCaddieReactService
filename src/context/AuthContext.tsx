import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AuthState {
  token: string | null;
  isActive: boolean;
  schoolId: string | null;
  schoolName: string | null;
  email: string | null;
}

interface AuthContextType extends AuthState {
  login: (data: {
    token: string;
    is_active: boolean;
    school_id: string;
    school_name: string;
    email: string;
  }) => void;
  logout: () => void;
  updateActivationStatus: (status: boolean) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState<AuthState>({
    token: null,
    isActive: false,
    schoolId: null,
    schoolName: null,
    email: null,
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const isActive = localStorage.getItem("is_active") === "true";
    const schoolId = localStorage.getItem("school_id");
    const schoolName = localStorage.getItem("school_name");
    const email = localStorage.getItem("email");
    setAuth({ token, isActive, schoolId, schoolName, email });
    setLoading(false);
  }, []);

  const login = (data: {
    token: string;
    is_active: boolean;
    school_id: string;
    school_name: string;
    email: string;
  }) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("is_active", String(data.is_active));
    localStorage.setItem("school_id", data.school_id);
    localStorage.setItem("school_name", data.school_name);
    localStorage.setItem("email", data.email);
    setAuth({
      token: data.token,
      isActive: data.is_active,
      schoolId: data.school_id,
      schoolName: data.school_name,
      email: data.email,
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("is_active");
    localStorage.removeItem("school_id");
    localStorage.removeItem("school_name");
    localStorage.removeItem("email");
    localStorage.removeItem("role_id");
    setAuth({ token: null, isActive: false, schoolId: null, schoolName: null, email: null });
  };

  const updateActivationStatus = (status: boolean) => {
    localStorage.setItem("is_active", String(status));
    setAuth((prev) => ({ ...prev, isActive: status }));
  };

  return (
    <AuthContext.Provider value={{ ...auth, login, logout, updateActivationStatus, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export default AuthContext;
