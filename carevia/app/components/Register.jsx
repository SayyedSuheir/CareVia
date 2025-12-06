"use client";

import { useEffect, useState, useContext } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { UserContext } from "./UserContext";

function Register() {
  const router = useRouter();
  const { setIsLoggedIn, setUser } = useContext(UserContext);
  
  const [countryCodes, setCountryCodes] = useState([]);
  const [filteredCountries, setFilteredCountries] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    countryCode: "",
    countryName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });

  // Fetch country codes
  useEffect(() => {
    const fetchCountryCodes = async () => {
      try {
        const response = await fetch(
          "https://restcountries.com/v3.1/all?fields=name,idd,cca2"
        );
        const data = await response.json();

        const codes = data
          .filter((country) => country.idd?.root)
          .map((country) => {
            const dialCode =
              country.idd.root + (country.idd.suffixes?.[0] || "");
            return {
              name: country.name.common,
              code: country.cca2,
              dialCode,
            };
          })
          .sort((a, b) => a.name.localeCompare(b.name));

        setCountryCodes(codes);
        setFilteredCountries(codes);
      } catch (error) {
        console.error("Country fetch error:", error);
        setError("Failed to load country codes. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    };
    fetchCountryCodes();
  }, []);

  // Validate passwords match
  useEffect(() => {
    if (formData.confirmPassword && formData.password !== formData.confirmPassword) {
      setPasswordError("Passwords do not match");
    } else {
      setPasswordError("");
    }
  }, [formData.password, formData.confirmPassword]);

  // Form validation
  const isFormReady =
    formData.name.trim() &&
    formData.countryCode &&
    formData.phone.trim() &&
    formData.email.trim() &&
    formData.password.length >= 8 &&
    formData.confirmPassword.length >= 8 &&
    formData.password === formData.confirmPassword &&
    formData.terms &&
    !isSubmitting;

  // Handlers
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setError("");
    
    if (name === "phone") {
      setFormData((prev) => ({
        ...prev,
        phone: value.replace(/[^0-9]/g, ""),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    setShowDropdown(true);
    if (!val.trim()) {
      setFilteredCountries(countryCodes);
      return;
    }
    setFilteredCountries(
      countryCodes.filter(
        (c) =>
          c.name.toLowerCase().startsWith(val.toLowerCase()) ||
          c.dialCode.includes(val)
      )
    );
  };

  const handleCountrySelect = (country) => {
    const numericCode = country.dialCode.replace("+", "00");
    setFormData((prev) => ({
      ...prev,
      countryCode: numericCode,
      countryName: country.name,
    }));
    setSearchTerm(numericCode);
    setShowDropdown(false);
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!isFormReady) return;

  setIsSubmitting(true);
  setError("");

  const dataToSubmit = {
    name: formData.name,
    email: formData.email,
    password: formData.password,
    phoneNumber: formData.countryCode + formData.phone,
    terms: formData.terms,
  };

  try {
    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(dataToSubmit),
    });

    const result = await response.json();

    // ✅ This is where you update the context after successful registration
    if (response.ok) {
      setUser(result.user);         // store user in context
      setIsLoggedIn(true);          // update logged-in state
      router.push("/");             // redirect to home page
    } else {
      setError(result.error || "Registration failed. Please try again.");
    }
  } catch (error) {
    console.error("Registration error:", error);
    setError("Network error. Please check your connection and try again.");
  } finally {
    setIsSubmitting(false);
  }
};



  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showDropdown && !e.target.closest('.country-dropdown-container')) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  return (
    <>
      <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />

      <div className="min-h-screen flex items-center justify-center bg-soft-gray p-4">
        <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl p-8 md:p-12 border border-gray-100">
          <h1 className="text-3xl font-extrabold text-text-primary text-center mb-6">Create Account</h1>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {loading && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-sm">
              Loading country codes...
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-text-primary mb-1">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={isSubmitting}
                placeholder="John Doe"
                className="form-input w-full p-3 border border-gray-300 rounded-lg placeholder-text-secondary focus:ring-0 focus:outline-none focus:border-primary-teal transition duration-150 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <div className="flex flex-col md:flex-row gap-2">
              <div className="relative w-full md:w-36 country-dropdown-container">
                <label htmlFor="country" className="block text-sm font-medium text-text-primary mb-1">
                  Country Code
                </label>
                <input
                  id="country"
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onFocus={() => !isSubmitting && setShowDropdown(true)}
                  disabled={isSubmitting || loading}
                  placeholder="Search..."
                  className="form-input w-full p-3 border border-gray-300 rounded-lg placeholder-text-secondary focus:ring-0 focus:outline-none focus:border-primary-teal transition duration-150 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                {showDropdown && !isSubmitting && (
                  <div className="absolute z-50 w-64 md:w-80 max-h-48 overflow-y-auto mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                    {filteredCountries.length > 0 ? (
                      filteredCountries.map((c) => (
                        <div
                          key={c.code}
                          onClick={() => handleCountrySelect(c)}
                          className="cursor-pointer p-2 flex justify-between hover:bg-gray-100 text-sm"
                        >
                          <span className="truncate">{c.name}</span>
                          <span className="ml-2 font-mono text-gray-600">{c.dialCode}</span>
                        </div>
                      ))
                    ) : (
                      <div className="p-2 text-gray-400 text-sm">No countries found</div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex-1">
                <label htmlFor="phone" className="block text-sm font-medium text-text-primary mb-1">
                  Phone Number
                </label>
                <input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="123456789"
                  required
                  disabled={isSubmitting}
                  className="w-full p-3 border border-gray-300 rounded-lg placeholder-text-secondary focus:ring-0 focus:outline-none focus:border-primary-teal transition duration-150 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="you@example.com"
                required
                value={formData.email}
                onChange={handleChange}
                disabled={isSubmitting}
                className="form-input w-full p-3 border border-gray-300 rounded-lg placeholder-text-secondary focus:ring-0 focus:outline-none focus:border-primary-teal transition duration-150 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                name="password"
                placeholder="Minimum 8 characters"
                required
                minLength={8}
                value={formData.password}
                onChange={handleChange}
                disabled={isSubmitting}
                className="form-input w-full p-3 border border-gray-300 rounded-lg placeholder-text-secondary focus:ring-0 focus:outline-none focus:border-primary-teal transition duration-150 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-primary mb-1">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                placeholder="Re-enter your password"
                required
                minLength={8}
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={isSubmitting}
                className={`form-input w-full p-3 border rounded-lg placeholder-text-secondary focus:ring-0 focus:outline-none transition duration-150 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                  passwordError ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-primary-teal'
                }`}
              />
              {passwordError && (
                <p className="mt-1 text-sm text-red-600">{passwordError}</p>
              )}
            </div>

            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                name="terms"
                checked={formData.terms}
                onChange={handleChange}
                disabled={isSubmitting}
                className="mt-1 disabled:cursor-not-allowed"
              />
              <span className="text-text-secondary">
                I agree to the{" "}
                <a href="/terms" className="text-primary-teal hover:text-action-blue font-medium">
                  Terms & Conditions
                </a>
              </span>
            </label>

            <button
              type="submit"
              disabled={!isFormReady}
              className={`w-full py-3 rounded-lg font-semibold transition shadow-md ${
                isFormReady
                  ? "bg-[#2BB0A8] text-white hover:bg-[#208a82] shadow-[#2BB0A8]/40"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
              }`}
            >
              {isSubmitting ? "Creating Account..." : "Register"}
            </button>
          </form>

          <div className="text-center mt-6 text-text-secondary text-sm">
            Already have an account?{" "}
            <a href="/loginPage" className="text-primary-teal hover:text-action-blue font-medium">
              Sign In
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

export default Register;
