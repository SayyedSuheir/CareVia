"use client";
import Coverbody from "./components/Coverbody";
import Coverfooter from "./components/Coverfooter";
// import Homepage from "./components/Homepage";

import Coverheader from "./components/Coverheader";



export default function Home() {
  return (
    <div>
      
      <main>
         
          {/* <Homepage/> */}
          <div>
           <Coverheader />
          </div>
          <div>
            <Coverbody/>
          </div>
          <div>
            <Coverfooter/>
          </div>
      </main>
    </div>
  );
}
