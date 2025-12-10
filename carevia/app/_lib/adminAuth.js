// ==========================================
// Middleware: Admin Authentication Check
// ==========================================
// File: lib/adminAuth.js

import jwt from "jsonwebtoken";
// Helper function to check if user is admin
function isAdmin(email) {
  return email && email.endsWith('@carevia.com');
}

export function verifyAdminToken(request) {
  try {
    const token = request.cookies.get("sessionToken")?.value;
    
    if (!token) {
      return { authorized: false, error: "No token provided" };
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
     if (!isAdmin(decoded.email)) {
      return { authorized: false, error: "Not an admin" };
    }

    return { 
      authorized: true, 
      userId: decoded.userId,
      email: decoded.email 
    };

  } catch (error) {
    return { 
      authorized: false, 
      error: error.message 
    };
  }
}
