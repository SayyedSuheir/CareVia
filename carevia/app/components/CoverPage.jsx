"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { useContext } from "react";
import { UserContext } from "../_context/UserContext";
import Image from 'next/image';

// Placeholder styles object (In a real Next.js app, this would be imported CSS modules or Tailwind/Styled-Components)
const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem 1rem',
    fontFamily: 'system-ui, sans-serif',
  },
  heroSection: {
    textAlign: 'center',
    marginBottom: '3rem',
    padding: '4rem 2rem',
    backgroundColor: '#f3f4f6', // Light gray background
    borderRadius: '12px',
  },
  title: {
    fontSize: '3rem',
    fontWeight: '800',
    color: '#2BB0A8',
  },
  subtitle: {
    fontSize: '1.5rem',
    fontWeight: '400',
    color: '#141414',
    maxWidth: '800px',
    margin: '1rem auto 2rem',
  },
  ctaButtons: {
    display: 'flex',
    justifyContent: 'center',
    gap: '1rem',
    marginTop: '2rem',
  },
  ctaButtonPrimary: {
    padding: '0.75rem 2rem',
    fontSize: '1.125rem',
    fontWeight: '700',
    color: 'white',
    backgroundColor: '#2BB0A8', //teal
    borderRadius: '8px',
    textDecoration: 'none',
    transition: 'background-color 0.2s',
  },
  ctaButtonSecondary: {
    padding: '0.75rem 2rem',
    fontSize: '1.125rem',
    fontWeight: '700',
    color: '#141414',
    backgroundColor: '#FFC857',
    border: '2px solid #FFC857',
    borderRadius: '8px',
    textDecoration: 'none',
    transition: 'background-color 0.2s, color 0.2s',
  },
  sectionTitle: {
    fontSize: '2rem',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: '2rem',
    color: '#2BB0A8',
    borderBottom: '2px solid #e5e7eb',
    paddingBottom: '0.5rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '2rem',
    marginBottom: '3rem',
  },
  card: {
    padding: '1.5rem',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    backgroundColor: 'white',
    textAlign: 'center',
  },
  cardIcon: {
    fontSize: '2.5rem',
    marginBottom: '1rem',
    color: '#2BB0A8',
  },
  cardTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
  },
  stepsContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '1.5rem',
    marginBottom: '3rem',
    flexWrap: 'wrap',
  },
  step: {
    flex: 1,
    minWidth: '200px',
    textAlign: 'center',
  },
  stepNumber: {
    display: 'inline-block',
    width: '40px',
    height: '40px',
    lineHeight: '40px',
    borderRadius: '50%',
    backgroundColor: '#2BB0A8',
    color: 'white',
    fontSize: '1.5rem',
    fontWeight: '700',
    marginBottom: '0.5rem',
  },
  footerCta: {
    textAlign: 'center',
    padding: '3rem 1rem',
    backgroundColor: '#e0e7ff', // Indigo-100
    borderRadius: '12px',
  }
};

const CoverPage = () => {
     const router = useRouter();
    const { user, isLoggedIn, setIsLoggedIn, setUser } = useContext(UserContext);
    const handleLogout = async () => {
    try {
      // ✅ FIX scroll locking (offcanvas cleanup)
      document.body.classList.remove("modal-open");
      document.body.style.overflow = "";

      document
        .querySelectorAll(".offcanvas-backdrop, .modal-backdrop")
        .forEach((el) => el.remove());
      
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        setIsLoggedIn(false);
        setUser(null);
        router.push("/");
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div style={styles.container}>
      {/* PAGE 1 CONTENT */}
         {/* 🔹 Top Navigation (ONLY when logged in) */}
      {isLoggedIn && (
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginBottom: "1rem" }}>
          <Link href="/homePage" style={styles.ctaButtonSecondary}>
            Home
          </Link>
          <button onClick={handleLogout} style={styles.ctaButtonPrimary}>
            Logout
          </button>
        </div>
      )}
      {/* Hero Section */}
      <section style={styles.heroSection}>
        <h1 style={styles.title}>
           Give What You Don't Need.  Change a Life.
        </h1>
        <p style={styles.subtitle}>
           Donate clothes, furniture, and essential items directly to people and families in your community who need them most. 
        </p>
        {!isLoggedIn && (
        <div style={styles.ctaButtons}>
          <Link href="/loginPage" style={styles.ctaButtonPrimary}>
             Donate Items 
          </Link>
          <Link href="/homePage" style={styles.ctaButtonSecondary}>
             Request Help 
          </Link>
        </div>
        )}
      </section>

      {/* What We Do Section */}
      <section>
         <h2 style={styles.sectionTitle}>What We Do </h2>
        <div style={styles.grid}>
          <div style={styles.card}>
            <p style={styles.cardIcon}>📦</p>
             <p>Reduce waste by redistributing usable items locally. </p>
          </div>
          <div style={styles.card}>
            <p style={styles.cardIcon}>🤝</p>
             <p>Connect donors with people who urgently need support. </p>
          </div>
          <div style={styles.card}>
            <p style={styles.cardIcon}>✅</p>
             <p>Ensure transparency through verified user accounts. </p>
          </div>
        </div>
      </section>

      {/* Our Services Section */}
      <section>
         <h2 style={styles.sectionTitle}>Our Services </h2>
        <div style={{ ...styles.grid, gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))' }}>
          <div style={styles.card}>
             <h3 style={styles.cardTitle}>• Item Donations </h3>
             <p>Post items such as clothing, furniture, and electronics. </p>
          </div>
          <div style={styles.card}>
             <h3 style={styles.cardTitle}>• Item Requests </h3>
             <p>Request items you or your family urgently need. </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section>
         <h2 style={styles.sectionTitle}>How It Works </h2>
        <div style={styles.stepsContainer}>
          <div style={styles.step}>
            <div style={styles.stepNumber}>1</div>
             <h3 style={styles.cardTitle}>List a Donation </h3>
             <p>Upload item photos and details. </p>
          </div>
          <div style={styles.step}>
            <div style={styles.stepNumber}>2</div>
             <h3 style={styles.cardTitle}>Match Requests </h3>
             <p>People request available items. </p>
          </div>
          <div style={styles.step}>
            <div style={styles.stepNumber}>3</div>
             <h3 style={styles.cardTitle}>Pickup or Delivery </h3>
             <p>Arrange a meeting or volunteer delivery. </p>
          </div>
        </div>
        {/* Placeholder for visual workflow diagram */}
        {/* <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          
          <Image
            src="/images/how-it-works-flow.svg"
            alt="How it works flow diagram"
            width={800}
            height={150}
            layout="responsive"
            style={{ opacity: 0.8 }}
          />
        </div> */}
      </section>

      {/* Why You Can Trust Us Section */}
      <section>
         <h2 style={styles.sectionTitle}>Why You Can Trust Us </h2>
        <div style={styles.grid}>
          <div style={styles.card}>
            <p style={styles.cardIcon}>🔒</p>
             <p>Verified users for safer exchanges</p>
          </div>
          <div style={styles.card}>
            <p style={styles.cardIcon}>📈</p>
             <p>Impact tracking to see lives helped </p>
          </div>
          <div style={styles.card}>
            <p style={styles.cardIcon}>📱</p>
           <p>Mobile-friendly access anytime </p>
          </div>
        </div>
      </section>

      {/* PAGE 2 CONTENT */}

      {/* Footer CTA Section */}
      <section style={styles.footerCta}>
        <h2 style={styles.title}>
          Ready to Make a Difference?  Start Today. 
        </h2>
         {!isLoggedIn && (
        <div style={styles.ctaButtons}>
          <Link href="/loginPage" style={styles.ctaButtonPrimary}>
             Donate Items 
          </Link>
          <Link href="/homePage" style={styles.ctaButtonSecondary}>
             Request Help 
          </Link>
        </div>
        )}
      </section>
    </div>
  );
};

export default CoverPage;