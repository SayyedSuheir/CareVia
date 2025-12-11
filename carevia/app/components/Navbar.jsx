"use client";
import Link from "next/link";
import { useContext } from "react";
import { useRouter } from "next/navigation";
import { UserContext } from "../_context/UserContext";


export default function Navbar() {
 
  const router = useRouter();
  const { user, isLoggedIn, setIsLoggedIn, setUser } = useContext(UserContext);

  // canvas close
  const closeOffcanvas = () => {
  const offcanvasEl = document.getElementById("offcanvasNavbar");
  if (!offcanvasEl) return;

  const instance =
    window.bootstrap?.Offcanvas.getInstance(offcanvasEl) ||
    new window.bootstrap.Offcanvas(offcanvasEl);

  instance.hide();
};


  const handleLogout = async () => {
    try {
        // ✅ FIX scroll locking (offcanvas cleanup)
    document.body.classList.remove("modal-open");
    document.body.style.overflow = "";

    document
      .querySelectorAll(".offcanvas-backdrop, .modal-backdrop")
      .forEach((el) => el.remove());
      
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
 <>
  {isLoggedIn ? (
    <>
      <nav className="navbar bg-body-tertiary fixed-top">
        <div className="container-fluid">

           <Link href="/homePage" className="navbar-brand">
              <span style={{ color: "white" }}>Care</span>
              <span style={{ color: "gold" }}>Via</span>
            </Link>

          {/* ✅ Toggler moved OUTSIDE offcanvas */}
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="offcanvas"
            data-bs-target="#offcanvasNavbar"
            aria-controls="offcanvasNavbar"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div
            className="offcanvas offcanvas-end"
            tabIndex="-1"
            id="offcanvasNavbar"
            aria-labelledby="offcanvasNavbarLabel"
            role="search"
          >
            <div className="offcanvas-header">
              <h5 className="offcanvas-title" id="offcanvasNavbarLabel">
                Welcome
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="offcanvas"
                aria-label="Close"
              ></button>
            </div>

            <div className="offcanvas-body">
              <div className="mydonation ">
                <Link href="/myDonation" onClick={closeOffcanvas} >Achievments</Link>
              </div>

              <div className="donate">
                <Link href="/donatePage" onClick={closeOffcanvas} >Donate</Link>
              </div>

              <div className="requesteditems">
                <Link href="/needs" onClick={closeOffcanvas} >Needs</Link>
              </div>

              <div className="logout">
                <button className="btn-logout " onClick={handleLogout}>
                  Logout
                </button>
              </div>
            </div>
          </div>

        </div>
      </nav>
    </>
  ) : (
    <>
      <nav className="navbar bg-body-tertiary fixed-top">
        <div className="container-fluid">
          <div className="nav-logo">
            <Link href="/homePage" className="navbar-brand">
              <span style={{ color: "white" }}>Care</span>
              <span style={{ color: "gold" }}>Via</span>
            </Link>
          </div>

          <div className="btns">
            <div className="register">
              <Link href="/registerPage">Register</Link>
            </div>

            <div className="login">
              <Link href="/loginPage">Login</Link>
            </div>
          </div>
        </div>
      </nav>
    </>
  )}
</>


  )
};