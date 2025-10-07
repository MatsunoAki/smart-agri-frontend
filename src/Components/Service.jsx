import React from 'react';
import IrrigationImage from '../assets/service-Irrigation-image.jpg';
import MonitoringImage from '../assets/service-Monitoring-image.jpg';
import DataAnalyticsImage from '../assets/service-Data-Analytics-image.jpg';

const Service = () => {
return (
<section className="py-20 bg-gray-50">
    <div className="container mx-auto px-6 lg:px-20 text-center">
    <h5 className="text-sm uppercase tracking-widest text-green-700 font-semibold mb-3">
        Our Expertise
    </h5>
    <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-6">
        Smarter Farming Starts Here
    </h2>
    <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-16">
        We bring together innovation, technology, and sustainability to help farmers maximize yields, reduce waste, and farm smarter.
    </p>
    </div>

    {/* Service Cards */}
    <div className="flex flex-wrap justify-center gap-8">
    {[
        {
        img: IrrigationImage,
        title: 'Smart Irrigation Solutions',
        desc: 'Precision watering systems that save water, reduce costs, and boost crop health through advanced IoT technology.',
        },
        {
        img: MonitoringImage,
        title: 'Real-Time Monitoring',
        desc: 'Get instant insights into soil moisture, climate conditions, and crop health — anytime, anywhere.',
        },
        {
        img: DataAnalyticsImage,
        title: 'Data-Driven Decisions',
        desc: 'Turn farming data into actionable strategies to improve productivity and profitability sustainably.',
        },
    ].map((service, index) => (
        <div
        key={index}
        className="bg-white rounded-xl shadow-lg overflow-hidden w-80 hover:shadow-xl transition-shadow duration-300"
        >
        <div className="overflow-hidden">
            <img
            src={service.img}
            alt={service.title}
            className="w-full h-56 object-cover transform transition-transform duration-500 hover:scale-110"
            />
        </div>
        <div className="p-6 text-center">
            <h3 className="text-2xl font-semibold text-green-800 mb-3">
            {service.title}
            </h3>
            <p className="text-gray-600 leading-relaxed">{service.desc}</p>
        </div>
        </div>
    ))}
    </div>
</section>
);
};

export default Service;

