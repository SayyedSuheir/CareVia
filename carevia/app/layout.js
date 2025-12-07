"use client";


import "./globals.css";

import { UserProvider } from './_context/UserContext'
import Navbar from "./components/Navbar";


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
       
      >
      <UserProvider>
        
          <Navbar/>
         
         {children}
        </UserProvider>
      </body>
    </html>
  );
}
