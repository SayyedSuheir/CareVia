"use client";

import Link from "next/link";


function Navbar() {
  return (
   <div>
        <nav className="navbar bg-body-tertiary">
            <div className="container-fluid">
                <div className="nav-logo">
                    <Link  href="#" className="navbar-brand ">CareVia</Link>
                </div>
                <div className="d-flex" role="search">
                    <div className="register">
                        <button className="btn-register">Register</button>
                    </div>
                    <div className="login">
                       <Link href={'/register'} ><button className="btn-login">Login</button></Link>
                    </div>
                </div>
            </div>
        </nav>
   </div>
  )
}

export default Navbar