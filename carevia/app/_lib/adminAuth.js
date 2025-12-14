import jwt from "jsonwebtoken";

function isAdmin(email) {
  return typeof email === "string" && email.endsWith("@carevia.com");
}

export function verifyAdminToken(request) {
  try {
    console.log("🔐 [AUTH] Starting verification...");
    
    // Check all cookies
    const allCookies = request.cookies.getAll();
    console.log("🍪 [AUTH] All cookies:", allCookies.map(c => c.name));
    
    const token = request.cookies.get("sessionToken")?.value;
    console.log("🍪 [AUTH] sessionToken exists:", !!token);
    
    if (token) {
      console.log("🍪 [AUTH] Token preview:", token.substring(0, 30) + "...");
    }

    if (!token) {
      console.log("❌ [AUTH] No token found");
      return {
        authorized: false,
        error: "Unauthorized: No token provided"
      };
    }

    if (!process.env.JWT_SECRET) {
      console.log("❌ [AUTH] JWT_SECRET missing!");
      return {
        authorized: false,
        error: "Server error: JWT secret not configured"
      };
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ [AUTH] Token decoded:", { 
      email: decoded.email, 
      userId: decoded.userId || decoded.id 
    });

    if (!decoded?.email) {
      console.log("❌ [AUTH] No email in token");
      return {
        authorized: false,
        error: "Invalid token payload"
      };
    }

    const adminCheck = isAdmin(decoded.email);
    console.log("👤 [AUTH] Admin check:", adminCheck, "for email:", decoded.email);

    if (!adminCheck) {
      console.log("❌ [AUTH] Not an admin email");
      return {
        authorized: false,
        error: "Access denied: Admin only"
      };
    }

    console.log("✅ [AUTH] Authorization successful!");
    return {
      authorized: true,
      userId: decoded.userId || decoded.id,
      email: decoded.email
    };

  } catch (error) {
    console.error("❌ [AUTH] Error:", error.message);
    console.error("❌ [AUTH] Error type:", error.name);

    return {
      authorized: false,
      error: "Invalid or expired token"
    };
  }
}
