import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Logo from "../assets/Logo-smartagri.png";
import { AiOutlineClose, AiOutlineMenu } from "react-icons/ai";

const Navbar = () => {
    const [navbarOpen, setNavbarOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    const handleToggle = () => setNavbarOpen(!navbarOpen);

    // Detect scroll to change navbar background (desktop only)
    useEffect(() => {
        const handleScroll = () => {
            if (!isMobile) {
                setScrolled(window.scrollY > 0);
            }
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [isMobile]);

    // Detect resize to update isMobile
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <header
            className={`fixed w-full top-0 z-50 transition-all duration-300 ${
                isMobile
                    ? "bg-[#334b35]" // mobile: always background
                    : scrolled
                    ? "bg-[#334b35]/90 backdrop-blur-md shadow-md" // desktop when scrolled
                    : "bg-transparent" // desktop at top
            }`}
        >
            <div className="container mx-auto">
                <nav className="flex justify-between items-center px-4 h-24">
                    {/* Logo */}
                    <Link
                        to="/"
                        className="flex items-center"
                        onClick={() => {
                            window.location.href = "/";
                        }}
                    >
                        <img src={Logo} alt="Smart Agri Logo" className="h-12 w-auto" />
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center justify-between flex-1 pl-8">
                        <ul className="flex space-x-4 font-bold text-white">
                            <li className="p-4 hover:text-[#f5c066] transition-colors">
                                <a href="#">Home</a>
                            </li>
                            <li className="p-4 hover:text-[#f5c066] transition-colors">
                                <a href="#about">About</a>
                            </li>
                            <li className="p-4 hover:text-[#f5c066] transition-colors">
                                <a href="#contact">Contact</a>
                            </li>
                        </ul>

                        <ul className="flex space-x-4">
                            <li>
                                <button
                                    className="px-6 py-2 bg-[#90ee90] text-[#334b35] rounded-full hover:bg-[#7ed37e] transition-colors font-bold"
                                    onClick={() => {
                                        window.location.href = "/login";
                                    }}
                                >
                                    Login
                                </button>
                            </li>
                            <li>
                                <button
                                    className="px-6 py-2 bg-[#f5c066] text-[#334b35] rounded-full hover:bg-gray-100 transition-colors font-bold"
                                    onClick={() => {
                                        window.location.href = "/register";
                                    }}
                                >
                                    Sign up
                                </button>
                            </li>
                        </ul>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden text-white">
                        {navbarOpen ? (
                            <AiOutlineClose size={24} onClick={handleToggle} />
                        ) : (
                            <AiOutlineMenu size={24} onClick={handleToggle} />
                        )}
                    </div>
                </nav>

                {/* Mobile Dropdown Menu */}
                {isMobile && navbarOpen && (
                    <div className="md:hidden bg-[#334b35] text-white px-4 py-4 shadow-md">
                        <ul className="flex flex-col space-y-3 font-bold text-center">
                            <li>
                                <a href="#" onClick={() => setNavbarOpen(false)}>Home</a>
                            </li>
                            <li>
                                <a href="#about" onClick={() => setNavbarOpen(false)}>About</a>
                            </li>
                            <li>
                                <a href="#contact" onClick={() => setNavbarOpen(false)}>Contact</a>
                            </li>
                            <li>
                                <button
                                    className="w-full px-6 py-2 bg-[#90ee90] text-[#334b35] rounded-full hover:bg-[#7ed37e] transition-colors"
                                    onClick={() => {
                                        window.location.href = "/login";
                                    }}
                                >
                                    Login
                                </button>
                            </li>
                            <li>
                                <button
                                    className="w-full px-6 py-2 bg-[#f5c066] text-[#334b35] rounded-full hover:bg-gray-100 transition-colors"
                                    onClick={() => {
                                        window.location.href = "/register";
                                    }}
                                >
                                    Sign up
                                </button>
                            </li>
                        </ul>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Navbar;
