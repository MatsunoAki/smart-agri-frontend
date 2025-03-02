import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'; 
import './Styles/Navbar.css';
import Logo from "../assets/Logo-smartagri.png";
import { AiOutlineClose, AiOutlineMenu } from 'react-icons/ai';

const Navbar = () => {
    const [navbarOpen, setNavbarOpen] = React.useState(false);
    const handleToggle = () => setNavbarOpen(!navbarOpen);

    React.useEffect(() => {
        setNavbarOpen(false);
    }, []);

    return (
        <div className="navbar">
            <section className="navbar-section text-white bg-[#334b35]">
                <div className="container mx-auto">
                    <nav className="navbar-nav flex justify-between items-center mx-auto px-4 h-24">
                        <Link to="/" className="navbar-logo" onClick={() => {window.location.href = "/"; }}>
                        <img id="logo" src={Logo} alt="Smart Agri Logo" />
                        </Link>
                        <div className="hidden md:flex items-center justify-between flex-1 pl-8 b">
                            <ul className="flex space-x-4">
                                <li className="navbar-link p-4 hover:text-[#263c28] transition-colors">
                                    <a href="#">Home</a>
                                </li>
                                <li className="navbar-link p-4 hover:text-[#263c28] transition-colors">
                                    <a href="#">About</a>
                                </li>
                                <li className="navbar-link p-4 hover:text-[#263c28] transition-colors">
                                    <a href="#">Contact</a>
                                </li>
                            </ul>
                            <ul className="flex space-x-4">
                                <li className="navbar-link">
                                    <a href="#" className="px-6 py-2 bg-[#90ee90] text-[#334b35] rounded-full hover:bg-[#7ed37e] transition-colors font-bold" 
                                    onClick={() => {window.location.href = "/login"; }}>
                                        Login
                                    </a>
                                </li>
                                <li className="navbar-link">
                                    <a href="#" className="px-6 py-2 bg-[#f5c066] text-[#334b35] rounded-full hover:bg-gray-100 transition-colors font-bold"
                                    onClick={() => {window.location.href = "/register"; }}>
                                        Sign up
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="navbar-hamburger block md:hidden">
                            {navbarOpen ? (
                                <AiOutlineClose size={20} onClick={handleToggle} />
                            ) : (
                                <AiOutlineMenu size={20} onClick={handleToggle} />
                            )}
                        </div>

                        {/* Mobile Menu */}
                        <div className={`fixed top-0 left-0 w-[60%] h-full  backdrop-blur-md border-r border-[#90ee90]/20 ease-in-out duration-500 ${navbarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                            <ul className="pt-24 px-4 flex flex-col space-y-3">
                                <a className="navbar-logo mb-6" href="#">
                                    <img id="logo" src="/src/assets/Logo-smartagri.png" alt="Smart Agri Logo" />
                                </a>
                                <li className="transition-colors font-medium hover:bg-white/10 border-b border-gray-300 ">
                                    <a href="#" className="block p-4">Home</a>
                                </li>
                                <li className="transition-colors font-medium hover:bg-white/10 border-b border-gray-300">
                                    <a href="#" className="block p-4">About</a>
                                </li>
                                <li className="transition-colors font-medium hover:bg-white/10 border-b border-gray-300">
                                    <a href="#" className="block p-4">Contact</a>
                                </li>
                                <li className="mt-4">
                                    <a href="#" className="block p-4 bg-[#90ee90] text-[#362706] rounded-full text-center font-bold hover:bg-[#7ed37e] transition-colors"
                                    onClick={() => {window.location.href = "/login"; }}>
                                        Login
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="block p-4 bg-[#f5c066] text-[#362706] rounded-full text-center font-bold hover:bg-gray-100 transition-colors"
                                    onClick={() => {window.location.href = "/register"; }}>
                                        Sign up
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </nav>
                </div>
            </section>
        </div>
    );
};

export default Navbar
