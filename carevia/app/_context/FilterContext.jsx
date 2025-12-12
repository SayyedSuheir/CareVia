"use client";

import { createContext, useState } from "react";

export const FilterContext = createContext();

export function FilterProvider({ children }) {
  const [filters, setFilters] = useState({
    city: "",
    type: "",
  });

  const updateFilters = (newFilters) => {
    setFilters((prev) => {
      const updated = { ...prev, ...newFilters };

      // Remove empty fields
      Object.keys(updated).forEach((k) => {
        if (!updated[k]) delete updated[k];
      });

      return updated;
    });
  };

  return (
    <FilterContext.Provider value={{ filters, updateFilters }}>
      {children}
    </FilterContext.Provider>
  );
}
