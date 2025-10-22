import React, { useState } from 'react';
// We'll add some icons for a modern touch
import { FiMail, FiPhone } from 'react-icons/fi';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault(); 
    console.log('Form data submitted:', formData);
    alert('Thank you for your message!');
    setFormData({
      name: '',
      email: '',
      phone: '',
      message: '',
    });
  };

  return (
    <section id="contact" className="py-20 bg-gray-50">
      <div className="container mx-auto px-6 lg:px-20">
        
        {/* Heading */}
        <div className="text-center lg:text-left lg:max-w-none">
          <h5 className="text-sm uppercase tracking-widest text-green-700 font-semibold mb-3">
            Get in Touch
          </h5>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-6">
            We’d Love to Hear From You
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto lg:mx-0 mb-12">
            Whether you have questions, feedback, or just want to chat about
            smart farming, our team is here to help.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-16">
          
          {/* Column 1: Contact Info */}
          <div className="lg:w-1/3 text-gray-700 space-y-6">
            <h3 className="text-2xl font-semibold text-gray-900">
              Contact Information
            </h3>
            <p className="text-lg leading-relaxed">
              Fill out the form, or if you prefer, you can reach us directly
              through the details below.
            </p>
            <a
              href="mailto:info@smartagri.com"
              className="flex items-center gap-4 text-lg group"
            >
              <FiMail className="text-green-600 size-6" />
              <span className="group-hover:text-green-700 transition-colors">
                info@smartagri.com
              </span>
            </a>
            <a
              href="tel:+123456789"
              className="flex items-center gap-4 text-lg group"
            >
              <FiPhone className="text-green-600 size-6" />
              <span className="group-hover:text-green-700 transition-colors">
                +1 (234) 567-890
              </span>
            </a>
          </div>

          {/* Column 2: Contact Form */}
          <form
            onSubmit={handleSubmit}
            className="lg:w-2/3 bg-white shadow-xl rounded-lg p-8 space-y-6"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-left font-semibold text-gray-700 mb-2"
                >
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-left font-semibold text-gray-700 mb-2"
                >
                  Your Email
                </label>
                <input
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-left font-semibold text-gray-700 mb-2"
              >
                Your Phone <span className="text-gray-400">(Optional)</span>
              </label>
              <input
                type="tel"
                id="phone"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label
                htmlFor="message"
                className="block text-left font-semibold text-gray-700 mb-2"
              >
                Your Message
              </label>
              <textarea
                id="message"
                placeholder="Write your message..."
                rows="5"
                value={formData.message}
                onChange={handleChange}
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full bg-[#90ee90] text-[#334b35] font-bold py-3 rounded-lg 
                         hover:bg-[#7ed37e] hover:scale-[1.02] transition-all duration-300 shadow-md"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contact;