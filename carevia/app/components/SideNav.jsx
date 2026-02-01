import Link from "next/link";
import { FaHome, FaSignOutAlt,FaSignInAlt, FaPlusCircle, FaHandHoldingUsd, FaHandHoldingHeart, FaRegBell } from "react-icons/fa";
import { usePathname, useRouter } from "next/navigation";
import { UserContext } from "../_context/UserContext";
import { useContext } from "react";
import Image from "next/image";
export default function SideNavbar() {
  
  const router = useRouter();
  const pathname = usePathname();
    
  if (pathname === "/" || pathname === "/loginPage" || pathname === "/registerPage") return null;
  
  const { user, isLoggedIn, setIsLoggedIn, setUser } = useContext(UserContext);

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
    <div className="side-navbar-container">
      <div className="side-navbar">
        <div className="nav-brand">
          {/* <h2>CareVia</h2> */}
           <Link href="/">
            <Image
            src="/carevialogo2.png"
            alt="Carevia"
            width={300}
            height={300}
          
          />
          </Link>
        </div>

        <nav className="nav-links">
          <Link href={"/homePage"}>
            <NavItem icon={<FaHome className="icon home" />} label="Home" active={pathname === "/homePage"} />
          </Link>

        <Link href={"/notificationsPage"}>
          <NavItem icon={<FaRegBell className="icon needs" />} label="Notifications" />
        </Link>
         
          <Link href={"/donatePage"}>
            <NavItem icon={<FaPlusCircle className="icon create" />} label="Create" active={pathname === "/donatePage"} />
          </Link>

          <Link href={"/myDonation"}>
            <NavItem icon={<FaHandHoldingUsd className="icon donations" />} label="Donations" active={pathname === "/myDonation"} />
          </Link>

          <Link href={"/needs"}>
            <NavItem icon={<FaHandHoldingHeart className="icon needs" />} label="Needs" active={pathname === "/needs"} />
          </Link>

           {!isLoggedIn ? (
          <Link href="/loginPage">
            <NavItem
              icon={<FaSignInAlt className="icon  home" />}
              label="Login"
            />
          </Link>
        ) : (
          <Link href="/" onClick={handleLogout}>
            <NavItem
              icon={<FaSignOutAlt className="icon logout home" />}
              label="Logout"
            />
          </Link>
        )}
        </nav>
      </div>
    </div>
  );
}

function NavItem({ icon, label, active }) {
  return (
    <button className={`nav-item ${active ? 'active' : ''}`}>
      {icon}
      <span>{label}</span>
    </button>
  );
}