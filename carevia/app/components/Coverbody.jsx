"use client"

function Coverbody() {
  return (
    <div className="coverbody">
      <div className="about-services">
         {/* ================= ABOUT ================= */}
      <section className="about container ">
        <h2>What We Do</h2>

        <p>
          Our donation platform connects generous donors with people in need. Instead of discarding valuable items,
          we make sure they reach those who can truly use them — quickly,
          transparently, and locally.
        </p>
      </section>


      {/* ================= SERVICES ================= */}
      <section className="services">
        <div className="container scontainer">

          <h2>Our Services</h2>

          <div className="services-grid">

            {[
              ["Item Donations","Post items like clothing, furniture, and electronics for donation."],
              ["Request Items","People  can request items they urgently need."],
             
              ["User Verification","Verified accounts ensure safety and transparency."],
              ["Impact Tracking","See how many lives your donations have helped."],
              ["Mobile Friendly","Donate from any device, anytime."]
            ].map(([title, desc], i) => (
              <div key={i} className="card">
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            ))}

          </div>
        </div>
      </section>

      </div>
      <div className="steps-impact">
        {/* ================= HOW IT WORKS ================= */}
        <section className="steps container-cover">
          <h2>How It Works</h2>

          <div className="steps-grid">

            {[
              ["1","List Donation","Upload items and details."],
              ["2","Match Requests","People request available items."],
              ["3","Pickup or Delivery","Arrange meeting or volunteer delivery."],
              ["4","Make Impact","Your donation changes lives."]
            ].map(([num,title,desc], i) => (
              <div key={i} className="step">
                <span className="step-number">{num}</span>
                <h4>{title}</h4>
                <p>{desc}</p>
              </div>
            ))}

          </div>
        </section>


        {/* ================= IMPACT ================= */}
        {/* <section className="impact">

          <div className="container impact-grid">

            {[
              ["5,000+","Items Donated"],
            
              ["300+","Active Volunteers"],
            
            ].map(([num,label], i) => (
              <div key={i}>
                <h3>{num}</h3>
                <p>{label}</p>
              </div>
            ))}

          </div>

        </section> */}
      </div>

      {/* ================= TESTIMONIALS ================= */}
      {/* <section className="testimonials">
        <div className="container">
          <h2>Community Stories</h2>

          <div className="testimonial-grid">

            {[
              `"My unused clothes reached a family within just two days!"`,
              `"I furnished my new apartment through donations here."`,
              `"Volunteering deliveries changed how I give back."`
            ].map((quote, i) => (
              <div key={i} className="testimonial">
                {quote}
              </div>
            ))}

          </div>
        </div>
      </section> */}
    </div>
  )
}

export default Coverbody