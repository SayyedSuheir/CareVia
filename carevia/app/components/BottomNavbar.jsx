import Link from "next/link";
import { FaHome, FaAward, FaPlusCircle, FaHandHoldingUsd, FaHandHoldingHeart } from "react-icons/fa";
import { usePathname } from "next/navigation";

export default function BottomNavbar() {
      const pathname = usePathname();
       if (pathname === "/") return null;
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
