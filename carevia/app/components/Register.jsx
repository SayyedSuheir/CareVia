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

  // ======================= COUNTRY FETCH ======================
  useEffect(() => {
    const fetchCountryCodes = async () => {
      try {
        const response = await fetch(
          "https://restcountries.com/v3.1/all?fields=name,idd,cca2,flags"
        );
        const data = await response.json();

        const codes = data
          .filter((country) => country.idd?.root)
          .map((country) => {
            const dialCode =
              country.idd.root + (country.idd.suffixes?.[0] || "");
            const formattedDialCode = dialCode.replace("+", "00");
            return {
              name: country.name.common,
              code: country.cca2,
              dialCode: formattedDialCode,
              flag: country.flags.svg,
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

  // ======================= FORM READY CHECK ======================
  const isFormReady =
    formData.name.trim() &&
    formData.countryCode &&
    formData.phone.trim() &&
    formData.email.trim() &&
    formData.password.length >= 8 &&
    formData.confirmPassword.length >= 8 &&
    formData.password === formData.confirmPassword &&
    formData.terms;

  // ======================= FORM HANDLERS ======================
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
        // ✅ Registration successful, redirect to donate page
        router.push("/donatePage");
      } else {
        alert(result.error || "Registration failed.");
      }
    } catch (error) {
      console.error("Registration error:", error);
      alert("An unexpected error occurred.");
    }
  };

  // ======================= GOOGLE LOGIN ======================
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
        alert(`✅ Welcome ${result.user.name}!`);
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
    if (!window.google || !window.google.accounts || !window.google.accounts.id) return;

    window.googleInitialized = true;

    window.google.accounts.id.initialize({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      callback: handleGoogleCallback,
      auto_select: false, // ❌ Prevent FedCM auto-select on dev
      cancel_on_tap_outside: false,
    });
  };

  const handleGoogleSignIn = () => {
    if (!window.google || !window.google.accounts || !window.google.accounts.id) {
      alert("Google Sign-In is still loading...");
      return;
    }

    try {
      initGoogle();
      window.google.accounts.id.prompt(); // show One Tap or chooser
    } catch (err) {
      console.error("Google Sign-In error:", err);
      alert("Google Sign-In failed.");
    }
  };

  // ======================= INPUT HANDLERS ======================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "phone") {
      return setFormData((prev) => ({
        ...prev,
        phone: value.replace(/[^0-9]/g, ""),
      }));
    }
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
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
        (country) =>
          country.name.toLowerCase().startsWith(val.toLowerCase()) ||
          country.dialCode.includes(val)
      )
    );
  };

  const handleCountrySelect = (country) => {
    setFormData((prev) => ({
      ...prev,
      countryCode: country.dialCode,
      countryName: country.name,
    }));
    setSearchTerm(country.name);
    setShowDropdown(false);
  };

  // ======================= UI ======================
  return (
    <>
      {/* Google Sign-In script */}
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
      />

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-blue-50 p-4">
        <div className="w-full max-w-lg bg-white shadow-xl p-8 rounded-xl">
          <h1 className="text-3xl font-bold text-center mb-2">Create Account</h1>
          <p className="text-center text-gray-500 mb-6">Register to get started</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Full name"
              className="w-full p-3 border rounded-lg"
            />
            <div className="flex gap-2">
              <input
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={() => setShowDropdown(true)}
                disabled={loading}
                placeholder="Search country"
                className="w-40 p-3 border rounded-lg"
              />
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone"
                required
                className="flex-1 p-3 border rounded-lg"
              />
            </div>

            {showDropdown && (
              <div className="border max-h-40 overflow-y-auto rounded">
                {filteredCountries.map((country) => (
                  <div
                    key={country.code}
                    onClick={() => handleCountrySelect(country)}
                    className="cursor-pointer p-2 flex justify-between hover:bg-gray-100"
                  >
                    <span>{country.name}</span>
                    <span>{country.dialCode}</span>
                  </div>
                ))}
              </div>
            )}

            <input
              type="email"
              name="email"
              placeholder="Email address"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg"
            />
            <input
              type="password"
              name="password"
              placeholder="Password (min 8)"
              required
              minLength={8}
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg"
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm password"
              required
              minLength={8}
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg"
            />

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="terms"
                checked={formData.terms}
                onChange={handleChange}
              />
              I agree to the Terms & Conditions
            </label>

            <button
              type="submit"
              disabled={!isFormReady}
              className={`w-full py-3 rounded-lg font-semibold transition ${
                isFormReady
                  ? "bg-[#2BB0A8] text-white hover:bg-teal-600"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Register
            </button>
          </form>

          <div className="my-6 text-center text-gray-400">OR</div>

          <button
            onClick={handleGoogleSignIn}
            className="w-full py-3 border rounded-lg hover:bg-gray-50"
          >
            Sign up with Google
          </button>
        </div>
      </div>
    </>
  );
}

export default Register;
