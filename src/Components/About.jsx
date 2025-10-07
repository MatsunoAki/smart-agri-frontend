import React from 'react';
import AboutImg from '../assets/About-image1.jpg';

const About = () => {
return (
<section id="about" className="py-20 bg-gray-50">
    <div className="container mx-auto px-6 lg:px-20 flex flex-col lg:flex-row items-center gap-16">
    
    {/* Image */}
    <div className="flex-1 relative group">
        <img
        src={AboutImg}
        alt="About Smart Agri"
        />
    </div>

    {/* Text */}
    <div className="flex-1 text-gray-800">
        <h5 className="text-sm uppercase tracking-widest text-green-700 font-semibold mb-3">
        Who We Are
        </h5>
        <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-6">
        Pioneering Smart Agriculture for a Sustainable Future
        </h2>
        <p className="text-lg text-gray-600 mb-6 leading-relaxed">
        We combine cutting-edge IoT technology with deep agricultural expertise to 
        help farmers optimize water use, improve crop yields, and monitor their fields in real time.
        </p>
        <p className="text-lg text-gray-600 leading-relaxed">
        Our mission is simple: make farming easier, smarter, and more productive — 
        while caring for the planet and future generations.
        </p>
    </div>
    </div>
</section>
);
};

export default About;
