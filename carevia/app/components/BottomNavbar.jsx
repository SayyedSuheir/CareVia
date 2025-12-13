import Link from "next/link";
import { FaHome, FaSignOutAlt, FaPlusCircle, FaHandHoldingUsd, FaHandHoldingHeart } from "react-icons/fa";
import { usePathname, useRouter } from "next/navigation";
import { UserContext } from "../_context/UserContext";
import { useContext } from "react";

export default function BottomNavbar() {
  
  const router = useRouter();
  const pathname = usePathname();
    
    if (pathname === "/" || pathname ==="/loginPage" || pathname==="/registerPage") return null;
  
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
    
    <div className="bottom-navbar-container">
    
      <div className="bottom-navbar">
        <Link href={"/homePage"}>
            <NavItem icon={<FaHome className="icon home" />} label="Home" />
        </Link>
       
        <Link href={"/donatePage"}>
        <NavItem icon={<FaPlusCircle className="icon create" />} label="Create" />
        </Link>

        <Link href={"/myDonation"}>
        <NavItem icon={<FaHandHoldingUsd className="icon donations" />} label="Donations" />
        </Link>

        <Link href={"/needs"}>
        <NavItem icon={<FaHandHoldingHeart className="icon needs" />} label="Needs" />
        </Link>

        <Link href={"/"} onClick={handleLogout}>
        <NavItem icon={<FaSignOutAlt className="icon logout" />} label="Logout" />
        </Link>

      </div>
    </div>
  );
}

function NavItem({ icon, label }) {
  return (
    <button className="nav-item">
      {icon}
      <span>{label}</span>
    </button>
  );
}
