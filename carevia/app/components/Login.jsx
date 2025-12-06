"use client"; 
import { useState, useContext } from "react";
import { useRouter } from "next/navigation";
import { UserContext } from "./UserContext";

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
        router.push("/");
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
    <div className="bg-soft-gray min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-2xl overflow-hidden p-8 md:p-10 border border-gray-100">

        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-text-primary mt-2">Welcome To CareVia</h1>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">

          <div>
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

          <div>
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

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-[#2BB0A8] text-white font-bold rounded-lg hover:bg-[#208a82] focus:outline-none focus:ring-4 focus:ring-primary-teal focus:ring-opacity-50 transition duration-150 shadow-md shadow-[#2BB0A8]/40 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {isLoading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="text-center mt-8">
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
