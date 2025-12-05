"use client";
import { useState, useContext } from "react";
import { useRouter } from "next/navigation";
import { UserContext } from "./UserContext";

export default function Login() {
  const router = useRouter();
  const { setIsLoggedIn } = useContext(UserContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    // Example API login request
    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem("userToken", data.token); // save token
      setIsLoggedIn(true); // update Navbar immediately
      router.push("/"); // redirect to homepage
    } else {
      alert("Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="bg-soft-gray min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-2xl overflow-hidden p-8 md:p-10 border border-gray-100">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-text-primary mt-2">Welcome To CareVia</h1>
         
        </div>

      

        

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-6">

          {/* Email Input */}
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
              className="form-input w-full p-3 border border-gray-300 rounded-lg placeholder-text-secondary focus:ring-0 focus:outline-none focus:border-primary-teal transition duration-150"
            />
          </div>

          {/* Password Input */}
          <div>
            <div className="flex justify-between items-center">
              <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-1">
                Password
              </label>
             
            </div>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="form-input w-full p-3 border border-gray-300 rounded-lg placeholder-text-secondary focus:ring-0 focus:outline-none focus:border-primary-teal transition duration-150"
            />
          </div>

          {/* Primary Action Button */}
          <button
            type="submit"
            className="w-full py-3 px-4 bg-[#2BB0A8] text-white font-bold rounded-lg hover:bg-[#208a82] focus:outline-none focus:ring-4 focus:ring-primary-teal focus:ring-opacity-50 transition duration-150 shadow-md shadow-[#2BB0A8]/40"
          >
            Sign In
          </button>
        </form>

        {/* Footer Link */}
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
