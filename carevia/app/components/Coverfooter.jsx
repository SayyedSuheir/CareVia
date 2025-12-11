"use client"
import Link from "next/link"
import { useContext } from "react";
import { UserContext } from "../_context/UserContext";
function Coverfooter() {
  const { isLoggedIn } = useContext(UserContext);
  return (
    <div>
          {/* ================= FINAL CTA ================= */}
      <section className="cta">

        <h2>Ready To Make A Difference?</h2>

        <p>Donate, request, or volunteer — it all starts today.</p>
      {!isLoggedIn && (
        <div className="hero-buttons">
          <Link href="/loginPage" className="btn primary btn-getstarted">Get Started</Link>
         
        </div>
      )}

      </section>


    </div>
  )
}

export default Coverfooter