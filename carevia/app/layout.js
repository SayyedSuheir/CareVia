"use client";
import "./globals.css";

import { UserProvider } from './components/UserContext'
import Navbar from "./components/Navbar";
import 'bootstrap/dist/css/bootstrap.min.css';

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
