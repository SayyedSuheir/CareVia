"use client";

import Image from "next/image";

function Card() {
  return (
    <div>
        
    <div  className="product-card bg-white mx-auto">
        
       
        <div  className="image-container">
           
            <Image
                src="/defaultGoods.png" 
                alt="Aero Dynamic Watch" 
                width={100}
                height={100}
                className="w-full h-full object-cover"
                
            />
        </div>

       
        <div  className="p-6 text-center">
            
          
            <h2  className="item-title text-xl font-bold">
                Aero Dynamic Watch
            </h2>
            
         
            <p  className="text-base text-gray-600 mb-6" >
                A sleek, modern timepiece designed for maximum efficiency and style.
            </p>

         
            <button  className="btn-primary w-full py-3 text-lg font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:ring-blue-500">
                Need It!
            </button>
        </div>

    </div>
    </div>
  )
}

export default Card