"use client";

import { useEffect, useState, useContext } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { UserContext } from "../_context/UserContext";

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

// const handleSubmit = async (e) => {
//   e.preventDefault();
//   if (!isFormReady) return;

//   setIsSubmitting(true);
//   setError("");

//   const dataToSubmit = {
//     name: formData.name,
//     email: formData.email,
//     password: formData.password,
//     phoneNumber: formData.countryCode + formData.phone,
//     terms: formData.terms,
//   };

//   try {
//     const response = await fetch("/api/register", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       credentials: "include",
//       body: JSON.stringify(dataToSubmit),
//     });

//     const result = await response.json();
//     await fetch("/api/auth/session", {
//       credentials: "include"
//     });
//     // ✅ This is where you update the context after successful registration
//     if (response.ok) {
//       setUser(result.user);         // store user in context
//       setIsLoggedIn(true);          // update logged-in state
//       router.push("/homePage");             // redirect to home page
//     } else {
//       setError(result.error || "Registration failed. Please try again.");
//     }
//   } catch (error) {
//     console.error("Registration error:", error);
//     setError("Network error. Please check your connection and try again.");
//   } finally {
//     setIsSubmitting(false);
//   }
// };



  // Close dropdown when clicking outside
 
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

    // ✅ Only continue if registration succeeded
    if (!response.ok) {
      throw new Error(result.error || "Registration failed");
    }

    // ✅ Ensure session cookie is finalized
    // await fetch("/api/auth/session", {
    //   credentials: "include",
    // });

    // ✅ Update auth context safely
    setUser(result.user);
    setIsLoggedIn(true);

    // ✅ Redirect AFTER session + context hydrate
    router.push("/homePage");

  } catch (error) {
    console.error("Registration error:", error);
    setError(error.message || "Network error. Please try again.");
  } finally {
    setIsSubmitting(false);
  }
};

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
      {/* <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" /> */}

      <div className="reg-container">
        
          <h1 className="reg-title">
            Create Account
          </h1>

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

          <form onSubmit={handleSubmit} className="reg-form">
            <div className="reg-fname">
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

            <div className="reg-phone-devs">
              <div className=" reg-c-code">
                <label htmlFor="country" className="block text-sm font-medium text-text-primary mb-1">
                   Phone Number
                </label>
                </div>
                <div className="reg-phonenumber">
                <div className="country-code country-dropdown-container">
                <input
                  id="country"
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onFocus={() => !isSubmitting && setShowDropdown(true)}
                  disabled={isSubmitting || loading}
                  placeholder="Search country code"
                  className="form-input w-full p-3 border border-gray-300 rounded-lg placeholder-text-secondary focus:ring-0 focus:outline-none focus:border-primary-teal transition duration-150 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                {showDropdown && !isSubmitting && (
                  <div className="country-code-dropdown">
                    {filteredCountries.length > 0 ? (
                      filteredCountries.map((c) => (
                        <div
                          key={c.code}
                          onClick={() => handleCountrySelect(c)}
                          className="country-item"
                        >
                          <span className="country-name">{c.name}</span>
                          <span className="country-code">{c.dialCode}</span>
                        </div>
                      ))
                    ) : (
                      <div className="no-results">No countries found</div>
                    )}
                  </div>
                  
                )}
                </div> 
              

              
                {/* <label htmlFor="phone" className="block text-sm font-medium text-text-primary mb-1">
                  Phone Number
                </label> */}
                <div className="reg-phone-input">
                  <input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="123456789"
                    required
                    disabled={isSubmitting}
                    className="phone-input"
                  />
                </div>
              </div>
            </div>

            <div className="reg-email">
              <label htmlFor="email" >
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

            <div className="reg-password">
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

            <div className="reg-confirm-password">
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
            <div className="reg-terms">
                <label className="reg-checkbox">
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
                    <a href="/terms" className="terms-link">
                      Terms & Conditions
                    </a>
                  </span>
                </label>
            </div>
            <div className="reg-btn">
              <button
                type="submit"
                disabled={!isFormReady}
                className={`btn-primary ${
                  isFormReady
                    ? "bg-[#2BB0A8] text-white hover:bg-[#208a82] shadow-[#2BB0A8]/40"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
                }`}
              >
                {isSubmitting ? "Creating Account..." : "Register"}
              </button>
            </div>
          </form>

          <div className="reg-footer">
            Already have an account?{" "}
            <a href="/loginPage" className="terms-link">
              Sign In
            </a>
          </div>
        </div>
      
    </>
  );
}

export default Register;