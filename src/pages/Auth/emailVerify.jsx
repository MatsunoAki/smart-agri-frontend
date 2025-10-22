import React from 'react';
import { Link } from 'react-router-dom';
import FarmBackground from "../../assets/farm-background.jpg"; // Adjust path as needed

const emailVerify = () => {
    return (
        <div
            className="w-screen h-screen flex justify-center items-center bg-cover bg-center bg-fixed"
            style={{ backgroundImage: `url(${FarmBackground})` }}
        >
            <div className="absolute inset-0 bg-black/70 z-10"></div>
            
            <main className="relative z-20 w-11/12 max-w-md p-8 bg-[#334b35] rounded-2xl shadow-xl text-center">
                <h1 className="text-white text-3xl font-bold pb-4">Check Your Email</h1>
                <p className="text-gray-200 pb-6">
                    We've sent a verification link to your email address. Please click the link to activate your account.
                </p>
                <Link 
                    to="/login" 
                    className="w-full inline-block py-3 bg-[#f5c066] text-[#334b35] rounded-full font-bold hover:bg-[#e6ad48] transition duration-300"
                >
                    Back to Login
                </Link>
            </main>
        </div>
    );
};

export default emailVerify;