"use client";

import Link from "next/link";
import { useContext } from "react";
import { UserContext } from "../_context/UserContext";

function Coverheader() {
  const {isLoggedIn} = useContext(UserContext);

  return (
    <div className="hero">
      <div className="container-coverpage">
      <div className="coverheader-btns-header">
        <div className="browse  hero-buttons">
        <Link href="/homePage" className="btn primary">
             Browse
          </Link>
        </div>
       {!isLoggedIn && (
        <div className="hero-buttons">
          <Link 
          href="/loginPage" 
          className="btn primary btn-getstarted">
            Get Started
            </Link>
         
        </div>

         )}
      </div>
        <h1>
          Give What You Don’t Need.
          <span> Change a Life.</span>
        </h1>

        <p>
          Donate clothes, furniture, and essentials directly to families,
          shelters, and people who need support in your community.
        </p>

        {!isLoggedIn && (
          <div className="hero-buttons donateitems">
            <Link href="/loginPage" className="btn primary donatebtn">
              Donate Items
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default Coverheader;
