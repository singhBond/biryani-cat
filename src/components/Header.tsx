import React from "react";

export const Header = () => (
  <div className="flex flex-col items-center text-center py-10 px-4 bg-linear-to-r from-red-900 via-black to-red-900">
    

    {/* Main Title Container - Using the Red Box Style from the image */}
    <div className="bg-red-600 border-2 border-yellow-500 px-8 py-2 shadow-lg relative">
      {/* Top Small Logo/Icon */}
    <div className="absolute bottom-8 justify-self-center">
       <img src="/logo.png" className="h-20 md:h-28 my-3" alt="Logo" />
    </div>
      <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter" 
          style={{ fontFamily: "'Rye', serif "}}>
        𝔅𝔦𝔯𝔶𝔞𝔫𝔦 ℌ𝔬𝔲𝔰𝔢 
      </h1>
      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-yellow-500 text-red-900 text-xs md:text-sm font-bold px-4 italic whitespace-nowrap">
        𝒜 𝐹𝒶𝓂𝒾𝓁𝓎 𝑅𝑒𝓈𝓉𝒶𝓊𝓇𝒶𝓃𝓉
      </div>
    </div>

    {/* Cuisine / Categories Section */}
    <div className="mt-6 mb-2">
      <p className="text-white text-xs md:text-sm font-bold tracking-widest uppercase border-y border-red-900 py-2">
        Indian <span className="text-yellow-500 px-1">|</span> Chinese <span className="text-yellow-500 px-1">|</span> Tandoor <span className="text-yellow-500 px-1">|</span> Shawarma
        <br />
        Momo <span className="text-yellow-500 px-1">|</span> Kathi Roll <span className="text-yellow-500 px-1">|</span> South Indian
      </p>
    </div>

    {/* Contact & Delivery Section */}
    <div className="flex flex-col items-center gap-1">
      <div className="flex items-center gap-2 text-blue-400">
        
         <span className="text-xs font-bold uppercase tracking-widest">Free Home Delivery</span>
         <img src="delivers.png" alt="scooter" className="h-10" />
      </div>
      <p className="text-yellow-500 font-bold text-lg md:text-xl">
        Call: +91 9113320865
      </p>
      <p className="text-gray-200 text-[10px] md:text-xs uppercase tracking-tighter">
        Accepting Online Order : 10:00 AM - 8:00 PM
      </p>
    </div>
  </div>
);