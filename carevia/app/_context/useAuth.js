"use client";

import { useContext } from "react";
import { UserContext } from "./UserContext";

/**
 * Custom hook to use auth context
 */
export function useAuth() {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("useAuth must be used within a UserProvider");
  }

  return context;
}

export default useAuth;