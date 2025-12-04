"use client";

import Link from "next/link";


function Navbar() {
  return (
   <div>
        <nav className="navbar ">
            <div className="container-fluid">
                <div className="nav-logo">
                    <Link  href="#" className="navbar-brand ">CareVia</Link>
                </div>
                <div className="d-flex btns" role="search">
                    <div className="register">
                        <button className="btn-register">Register</button>
                    </div>
                    <div className="login">
                       <button className="btn-login">Login</button>
                    </div>
                </div>
            </div>
        </nav>
   </div>
  )
}

export default Navbar