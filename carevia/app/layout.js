
import "./globals.css";

import { UserProvider } from './components/UserContext'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
       
      >
      <UserProvider>
         {children}
        </UserProvider>
      </body>
    </html>
  );
}
