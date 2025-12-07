"use client";

import { createContext, useState, useEffect, useCallback } from "react";

export const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  /**
   * ✅ Check server session
   */
  const checkSession = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/session", {
        credentials: "include",
        cache: "no-store",
      });

      const data = await res.json();

      if (res.ok && data.isLoggedIn && data.user) {
        setUser(data.user);
        setIsLoggedIn(true);
      } else {
        setUser(null);
        setIsLoggedIn(false);
      }
    } catch (err) {
      console.error("Session check failed:", err);
      setUser(null);
      setIsLoggedIn(false);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * ✅ Login
   */
  const login = useCallback(async (email, password) => {
    try {
      const res = await fetch("/api/login", {  // ✅ FIXED ROUTE
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.success && data.user) {
        setUser(data.user);
        setIsLoggedIn(true);
        return { success: true, user: data.user };
      }

      return { success: false, error: data.error || "Login failed" };

    } catch (err) {
      console.error("Login error:", err);
      return { success: false, error: "Network error. Please try again." };
    }
  }, []);

  /**
   * ✅ Logout
   */
  const logout = useCallback(async () => {
    try {
      await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });

      setUser(null);
      setIsLoggedIn(false);

      return { success: true };

    } catch (err) {
      console.error("Logout error:", err);
      return { success: false, error: "Logout failed" };
    }
  }, []);

  /**
   * ✅ Run session check once on load
   */
  useEffect(() => {
    checkSession();
  }, [checkSession]);

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        isLoggedIn,
        setIsLoggedIn,
        loading,
        login,
        logout,
        checkSession,
      }}
    >
      {!loading && children}
    </UserContext.Provider>
  );
}
