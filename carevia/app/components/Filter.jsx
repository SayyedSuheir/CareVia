"use client";

import { useState, useEffect, useContext } from "react";
import { FaMapMarkerAlt, FaTags, FaChevronDown } from "react-icons/fa";
import { FilterContext } from "../_context/FilterContext";
export default function Filters() {
  const { filters, updateFilters } = useContext(FilterContext);

  const [openDropdown, setOpenDropdown] = useState(null);
  const [locations, setLocations] = useState({});
  const [types, setTypes] = useState([]);

  // Fetch location groups
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/filters/location");
        const data = await res.json();
        setLocations(data.locations || {});
      } catch (error) {
        console.error("Location fetch failed:", error);
      }
    }

    fetchData();
  }, []);

  // Toggle dropdowns
  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  // fetch types filter

  useEffect(() => {
  async function fetchTypes() {
    try {
      const res = await fetch("/api/filters/typefilter");
      const data = await res.json();
      setTypes(data.types || []);
    } catch (error) {
      console.error("Type fetch failed:", error);
    }
  }
  fetchTypes();
  }, []);


  return (
    <>
    

      <div className="filters-container">
        {/* LOCATION FILTER */}
        <div className="filter-wrapper">
          <div className="filter-box" onClick={() => toggleDropdown("location")}>
            <FaMapMarkerAlt className="filter-icon" />
            <span className="filter-label">Location</span>
            <FaChevronDown
              className={`filter-arrow ${openDropdown === "location" ? "rotate" : ""}`}
            />
          </div>

          {openDropdown === "location" && (
            <div className="dropdown">
              {Object.keys(locations).map((region) => (
                <div key={region} className="dropdown-group">
                  <div className="dropdown-title">{region}</div>

                  {locations[region].map((city) => (
                    <div key={city} 
                    className="dropdown-item"
                    onClick={()=>updateFilters({city: city})}>
                      {city}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* TYPE FILTER */}
        <div className="filter-wrapper">
          <div className="filter-box" onClick={() => toggleDropdown("type")}>
            <FaTags className="filter-icon" />
            <span className="filter-label">Type</span>
            <FaChevronDown
              className={`filter-arrow ${openDropdown === "type" ? "rotate" : ""}`}
            />
          </div>

          {openDropdown === "type" && (
            <div className="dropdown">
             
              { types.map((t) => (
                <div 
                  key={t}
                  className="dropdown-item"
                  onClick={() => updateFilters({type: t})}>
                    {t}
                </div>
              ))}

            </div>
          )}
        </div>
      </div>
    </>
  );
}