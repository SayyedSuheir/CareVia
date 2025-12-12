"use client";



import Card from './Card';
// import Navbar from './Navbar';
import Filter from './Filter'

function Homepage() {
  return (
    <div>
     
          {/* <header>
            <Navbar/>
          </header> */}
          <main 
          style={{ display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center"}}
                      >
            <Filter/>
            <Card/>
          </main>
        
    </div>
  )
}

export default Homepage