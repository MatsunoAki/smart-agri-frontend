import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'; 

const Register = () => {
    return (
        <div
            className="w-screen h-screen flex justify-center items-center bg-cover bg-center bg-fixed"
            style={{ backgroundImage: "url('/public/assets/farm-background.jpg')" }}
        >
            <div className="absolute inset-0 bg-black opacity-70 z-10"></div>
            <header className="absolute top-2 left-2 z-30">
                <Link to="/" className="navbar-logo">
                    <img
                        id="logo"
                        src="/src/assets/Logo-smartagri.png"
                        alt="Smart Agri Logo"
                        className="w-48 h-auto"
                    />
                </Link>
            </header>
            <main className="relative z-20 w-80% max-w-sm p-10 bg-[#364c38] rounded-lg flex flex-col">
                <h1 className="text-white text-3xl pb-4">Register</h1>
                <p className="text-white pb-2">
                    Create an account to access the Smart Agri-irrigation
                </p>
                <form className="w-full">
                    <div className="form-floating mb-3">
                        <input
                            type="text"
                            className="form-control bg-[#2a3e2c] text-white p-3 rounded mb-4 w-full"
                            id="floatingUsername"
                            placeholder="Username"
                        />
                    </div>
                    <div className="form-floating mb-3">
                        <input
                            type="email"
                            className="form-control bg-[#2a3e2c] text-white p-3 rounded mb-4 w-full"
                            id="floatingEmail"
                            placeholder="Email address - name@example.com"
                        />
                    </div>
                    <div className="form-floating mb-3">
                        <input
                            type="password"
                            className="form-control bg-[#2a3e2c] text-white p-3 rounded mb-4 w-full"
                            id="floatingPassword"
                            placeholder="Password"
                        />
                    </div>
                    <div className="form-floating mb-3">
                        <input
                            type="password"
                            className="form-control bg-[#2a3e2c] text-white p-3 rounded mb-4 w-full"
                            id="floatingConfirmPassword"
                            placeholder="Confirm Password"
                        />
                    </div>
                    <div className="flex justify-center pb-2">
                        <button
                            type="button"
                            className="w-full px-6 py-2 bg-[#f5c066] text-[#364c38] rounded-full hover:bg-gray-100 transition-colors font-bold"
                        >
                            Register
                        </button>
                    </div>
                    <div className="text-center">
                        <p className="text-white">
                            Already a member?{' '}
                            <a href="#" className="text-[#f5c066]" onClick={() => {window.location.href = "/login"; }}>
                                Sign in
                            </a>
                        </p>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default Register;