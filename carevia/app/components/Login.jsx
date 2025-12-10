"use client"; 
import { useState, useContext } from "react";
import { useRouter } from "next/navigation";
import { UserContext } from "../_context/UserContext";

export default function Login() {
  const router = useRouter();
  const { setIsLoggedIn, setUser } = useContext(UserContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Important for cookies
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsLoggedIn(true);
        setUser(data.user || { email });
        router.push("/homePage");
      } else {
        setError(data.error || "Login failed. Please check your credentials.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-form-container">
      <div className="head-login-form">

        <div className="login-welcome text-center mb-10">
          <h1 className="text-3xl font-extrabold text-text-primary mt-2">Welcome To CareVia</h1>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="login-form">

          <div className="email-section">
            <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className="form-input w-full p-3 border border-gray-300 rounded-lg placeholder-text-secondary focus:ring-0 focus:outline-none focus:border-primary-teal transition duration-150 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          <div className="password-section">
            <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              className="form-input w-full p-3 border border-gray-300 rounded-lg placeholder-text-secondary focus:ring-0 focus:outline-none focus:border-primary-teal transition duration-150 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>
        <div className="sign-btn-container">
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary btn-signin"
          >
            {isLoading ? "Signing In..." : "Sign In"}
          </button>
        </div>
        </form>

        <div className="login-footer">
          <p className="text-text-secondary text-sm">
            Don't have an account?{" "}
            <a href="/registerPage" className="text-primary-teal hover:text-action-blue font-medium transition duration-150">
              Register Here
            </a>
          </p>
        </div>

      </div>
    </div>
  );
}