"use client";

import "bootstrap/dist/css/bootstrap.min.css";
import BootstrapClient from "./providers";
import "./globals.css";
import { useAuth } from "./_context/useAuth"
import { UserProvider } from './_context/UserContext'
// import Navbar from "./components/Navbar";
import BottomNavbar from "./components/BottomNavbar";
import { FilterProvider } from "./_context/FilterContext";
import SideNavbar from "./components/SideNav";

function NavbarWrapper() {
  const { isLoggedIn } = useAuth()

  if (!isLoggedIn) return null     // ✅ Hide navbar before login

  return <SideNavbar />
}



export default function RootLayout({ children }) {
  
  return (
    <html lang="en" >
      
      <body 
       
      >
      <UserProvider>
        <FilterProvider>   
        <BootstrapClient />
        <NavbarWrapper />
         <BottomNavbar/>
         {children}
         </FilterProvider>
        </UserProvider>
      </body>
    </html>
  );
}
