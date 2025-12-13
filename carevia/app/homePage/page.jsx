"use client"
import "bootstrap/dist/css/bootstrap.min.css";
// import BootstrapClient from "@/app/providers";
import Homepage from "../components/Homepage"
// import Navbar from "../components/Navbar"
// import { FilterProvider } from "../_context/FilterContext";

function page() {
  return (
    <div className="homepage-container">
       
        {/* <FilterProvider>    */}
            <Homepage />
        {/* </FilterProvider>  */}
    </div>
  )
}

export default page