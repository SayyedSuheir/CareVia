"use client";

import "bootstrap/dist/css/bootstrap.min.css";
import BootstrapClient from "./providers";
import "./globals.css";

import { UserProvider } from './_context/UserContext'
import Navbar from "./components/Navbar";



export default function RootLayout({ children }) {
  
  return (
    <html lang="en" >
      <body 
       
      >
      <UserProvider>
        
        <BootstrapClient />
        <Navbar/>
         
         {children}
        </UserProvider>
      </body>
    </html>
  );
}
