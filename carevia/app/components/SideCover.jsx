"user client";
import Image from "next/image";

function SideCover() {
  return (
    <div className='sidecover-component'>
        <div className="sidecover-image">
          <Image 
          src="/sidecover1.png"
          alt="side cover"
          width={200}
          height={200}
          />
        </div>
    </div>
  )
}

export default SideCover