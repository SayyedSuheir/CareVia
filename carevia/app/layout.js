"use client";

import "bootstrap/dist/css/bootstrap.min.css";
import BootstrapClient from "./providers";
import "./globals.css";
import { useAuth } from "./_context/useAuth"
import { UserProvider } from './_context/UserContext'
import Navbar from "./components/Navbar";

function NavbarWrapper() {
  const { isLoggedIn } = useAuth()

  if (!isLoggedIn) return null     // ✅ Hide navbar before login

  return <Navbar />
}



export default function RootLayout({ children }) {
  
  return (
    <html lang="en" >
      
      <body 
       
      >
      <UserProvider>
        
        <BootstrapClient />
        <NavbarWrapper />
         
         {children}
        </UserProvider>
      </body>
    </html>
  );
}
