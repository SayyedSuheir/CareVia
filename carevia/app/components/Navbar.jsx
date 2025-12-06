"use client";
import Link from "next/link";
import { useContext } from "react";
import { useRouter } from "next/navigation";
import { UserContext } from "./UserContext";

export default function Navbar() {
 
  const router = useRouter();
  const { user, isLoggedIn, setIsLoggedIn, setUser } = useContext(UserContext);




  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        setIsLoggedIn(false);
        setUser(null);
        router.push("/");
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <nav className="navbar">
      <div className="container-fluid">
        <div className="nav-logo">
          <Link href="/" className="navbar-brand">
            CareVia
          </Link>
        </div>
        <div className="d-flex btns" role="search">
          {isLoggedIn ? (
            <>
              <div className="donate">
                <Link href="/donatePage">
                  <button className="btn-donate">Donate</button>
                </Link>
              </div>
              <div className="logout">
                <button className="btn-logout" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="register">
                <Link href="/registerPage">
                  <button className="btn-register">Register</button>
                </Link>
              </div>
              <div className="login">
                <Link href="/loginPage">
                  <button className="btn-login">Login</button>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  )
};