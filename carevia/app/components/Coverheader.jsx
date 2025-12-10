"use client"
import Link from 'next/link'

function Coverheader() {
  return (
    <div className="hero">
          <div className="container">
          <h1>
            Give What You Don’t Need.
            <span> Change a Life.</span>
          </h1>

          <p>
            Donate clothes, furniture, and essentials directly to families,
            shelters, and people who need support in your community.
          </p>

          <div className="hero-buttons">
            <Link href="/loginPage" className="btn primary">
              Donate Items
            </Link>

            {/* <a href="/requests" className="btn outline">
              Browse Requests
            </a> */}
          </div>
        </div>
    </div>
  )
}

export default Coverheader