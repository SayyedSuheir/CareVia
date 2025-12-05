"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";

function Register() {
  const router = useRouter();
  const [countryCodes, setCountryCodes] = useState([]);
  const [filteredCountries, setFilteredCountries] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(true);

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
      } finally {
        setLoading(false);
      }
    };
    fetchCountryCodes();
  }, []);

  // Form validation
  const isFormReady =
    formData.name.trim() &&
    formData.countryCode &&
    formData.phone.trim() &&
    formData.email.trim() &&
    formData.password.length >= 8 &&
    formData.confirmPassword.length >= 8 &&
    formData.password === formData.confirmPassword &&
    formData.terms;

  // Handlers
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
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
  const numericCode = country.dialCode.replace("+", "00"); // convert + to 00
  setFormData((prev) => ({
    ...prev,
    countryCode: numericCode, // store numeric code
    countryName: country.name,
  }));
  setSearchTerm(numericCode); // show the code in the input
  setShowDropdown(false);
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormReady) return;

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
        body: JSON.stringify(dataToSubmit),
      });
      const result = await response.json();
      if (response.ok) {
        router.push("/donatePage");
      } else {
        alert(result.error || "Registration failed.");
      }
    } catch (error) {
      console.error("Registration error:", error);
      alert("An unexpected error occurred.");
    }
  };

  // Google Sign-In
  const handleGoogleCallback = async (response) => {
    try {
      const payload = JSON.parse(atob(response.credential.split(".")[1]));
      const googleData = {
        googleId: payload.sub,
        name: payload.name,
        email: payload.email,
        avatar: payload.picture,
      };
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(googleData),
      });
      const result = await res.json();
      if (res.ok) {
        localStorage.setItem("user", JSON.stringify(result.user));
        window.location.href = "/dashboard";
      } else {
        alert(result.error || "Google Sign-In failed.");
      }
    } catch (error) {
      console.error("Google callback error:", error);
      alert("Google authentication failed.");
    }
  };

  const initGoogle = () => {
    if (window.googleInitialized) return;
    if (!window.google?.accounts?.id) return;

    window.googleInitialized = true;
    window.google.accounts.id.initialize({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      callback: handleGoogleCallback,
    });
  };

  const handleGoogleSignIn = () => {
    if (!window.google?.accounts?.id) {
      alert("Google Sign-In is loading...");
      return;
    }
    initGoogle();
    window.google.accounts.id.prompt();
  };

  return (
    <>
      <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />

      <div className="min-h-screen flex items-center justify-center bg-soft-gray p-4">
        <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl p-8 md:p-12 border border-gray-100">
          <h1 className="text-3xl font-extrabold text-text-primary text-center mb-2">Create Account</h1>
         

         

         

          <form onSubmit={handleSubmit} className="space-y-6">
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Full Name"
              className="form-input w-full p-3 border border-gray-300 rounded-lg placeholder-text-secondary focus:ring-0 focus:outline-none focus:border-primary-teal transition duration-150"
            />

            {/* Country Code + Phone */}
            <div className="flex flex-col md:flex-row gap-2 relative">
              <div className="relative w-full md:w-36">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onFocus={() => setShowDropdown(true)}
                  placeholder="Type country..."
                  className="form-input w-full p-3 border border-gray-300 rounded-lg placeholder-text-secondary focus:ring-0 focus:outline-none focus:border-primary-teal transition duration-150"
                />
                {showDropdown && (
                  <div className="absolute z-50 w-full max-h-48 overflow-y-auto mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                    {filteredCountries.length > 0 ? (
                      filteredCountries.map((c) => (
                        <div
                          key={c.code}
                          onClick={() => handleCountrySelect(c)}
                          className="cursor-pointer p-2 flex justify-between hover:bg-gray-100"
                        >
                          <span>{c.name}</span>
                          <span>{c.dialCode}</span>
                        </div>
                      ))
                    ) : (
                      <div className="p-2 text-gray-400">No countries found</div>
                    )}
                  </div>
                )}
              </div>

              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone"
                required
                className="flex-1 p-3 border rounded-lg"
              />
            </div>

            <input
              type="email"
              name="email"
              placeholder="Email"
              required
              value={formData.email}
              onChange={handleChange}
              className="form-input w-full p-3 border border-gray-300 rounded-lg placeholder-text-secondary focus:ring-0 focus:outline-none focus:border-primary-teal transition duration-150"
            />
            <input
              type="password"
              name="password"
              placeholder="Password (min 8)"
              required
              minLength={8}
              value={formData.password}
              onChange={handleChange}
              className="form-input w-full p-3 border border-gray-300 rounded-lg placeholder-text-secondary focus:ring-0 focus:outline-none focus:border-primary-teal transition duration-150"
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              required
              minLength={8}
              value={formData.confirmPassword}
              onChange={handleChange}
              className="form-input w-full p-3 border border-gray-300 rounded-lg placeholder-text-secondary focus:ring-0 focus:outline-none focus:border-primary-teal transition duration-150"
            />

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="terms"
                checked={formData.terms}
                onChange={handleChange}
              />
              I agree to the{" "}
              <a href="#" className="text-primary-teal hover:text-action-blue font-medium">
                Terms & Conditions
              </a>
            </label>

            <button
              type="submit"
              disabled={!isFormReady}
              className={`w-full py-3 rounded-lg font-semibold transition ${
                isFormReady
                  ? "bg-[#2BB0A8] text-white hover:bg-[#208a82]"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Register
            </button>
          </form>

          <div className="text-center mt-6 text-text-secondary">
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
