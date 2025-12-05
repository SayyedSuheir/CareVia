"use client";

import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from './Navbar';
import Card from './Card';


function Homepage() {
  return (
    <div>
     
          <header>
              <Navbar/>
          </header>
          <main>
            <Card/>
          </main>
        
    </div>
  )
}

export default Homepage