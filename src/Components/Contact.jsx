import React from 'react';

const Contact = () => {
    return (
        <section id="contact" className="py-20 bg-gray-50">
            <div className="container mx-auto px-6 lg:px-20 text-center">
                {/* Heading */}
                <h5 className="text-sm uppercase tracking-widest text-green-700 font-semibold mb-3">
                    Get in Touch
                </h5>
                <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-6">
                    We’d Love to Hear From You
                </h2>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-16">
                    Whether you have questions, feedback, or just want to chat about smart farming, our team is here to help.
                </p>

                {/* Contact Form */}
                <form className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg p-8 space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-left font-semibold text-gray-700 mb-2">
                            Your Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            placeholder="Enter your name"
                            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-left font-semibold text-gray-700 mb-2">
                            Your Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            placeholder="Enter your email"
                            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="phone" className="block text-left font-semibold text-gray-700 mb-2">
                            Your Phone Number
                        </label>
                        <input
                            type="tel"
                            id="phone"
                            placeholder="Enter your phone number"
                            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="message" className="block text-left font-semibold text-gray-700 mb-2">
                            Your Message
                        </label>
                        <textarea
                            id="message"
                            placeholder="Write your message..."
                            rows="5"
                            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                        ></textarea>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition-colors"
                    >
                        Send Message
                    </button>
                </form>
            </div>
        </section>
    );
}

export default Contact;
