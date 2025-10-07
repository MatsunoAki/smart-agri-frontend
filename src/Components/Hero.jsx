import React from "react";
import HeroBg from "../assets/index-background.jpg"; // Import local background image

const Hero = () => {
return (
<section
    className="relative w-full text-white flex items-center min-h-screen bg-fixed bg-center bg-cover"
    style={{ backgroundImage: `url(${HeroBg})` }}
>
    {/* Overlay */}
    <div className="absolute inset-0 bg-black/50"></div>

    {/* Hero Content */}
    <div className="relative z-10 w-full px-6 lg:px-0 lg:max-w-[700px] lg:mx-[193px]">
    <h5 className="text-sm uppercase tracking-widest text-green-300 font-semibold mb-2">
        Farm Smarter, Not Harder
    </h5>
    <h1 className="text-4xl lg:text-6xl font-bold text-[#f5c066] leading-tight drop-shadow-lg">
        Welcome to Smart Agri-Irrigation
    </h1>
    <h2 className="text-lg lg:text-2xl font-semibold mt-4 text-gray-100">
        The future of farming at your fingertips
    </h2>
    <p className="mt-6 text-base lg:text-lg text-gray-200 leading-relaxed">
        Our system ensures efficient water usage, reducing waste and increasing
        crop yield. Manage your irrigation from anywhere with real-time
        monitoring and automated controls.
    </p>

    {/* Buttons */}
    <div className="mt-8 flex flex-wrap gap-4">
        <a
        href="/register"
        className="px-6 py-3 bg-[#90ee90] text-[#334b35] rounded-full font-bold hover:bg-[#7ed37e] transition-all shadow-md hover:shadow-lg"
        >
        Get Started
        </a>
        <a
        href="#about"
        className="px-6 py-3 bg-[#f5c066] text-[#334b35] rounded-full font-bold hover:bg-gray-100 transition-all shadow-md hover:shadow-lg"
        >
        Learn More
        </a>
    </div>
    </div>
</section>
);
};

export default Hero;
