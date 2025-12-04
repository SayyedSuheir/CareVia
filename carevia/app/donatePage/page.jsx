"use client";
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from '../components/Navbar';
import Card from '../components/Card';

function page() {
  return (
    <div>
        <header>
            <Navbar />
        </header>
        <main>
          <Card/>
        </main>
    </div>
  )
}

export default page