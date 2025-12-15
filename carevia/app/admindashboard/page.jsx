"use client"

import AdminDashboard from "../components/AdminDashboard"
import BootstrapClient from "../components/BootstrapClient"

function page() {
  return (
    <div  className='admindashboard-container'>
      <BootstrapClient/>
        <AdminDashboard/>

    </div>
  )
}

export default page