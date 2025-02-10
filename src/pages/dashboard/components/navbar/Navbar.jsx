import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AiOutlineClose, AiOutlineMenu } from 'react-icons/ai';

const Navbar = () => {
    const navigate = useNavigate();
    const handleLogoClick = () => {
        navigate('/dashboard/home'); 
        window.location.reload(); // Force reload after navigation
    };
    return (
        <div className="navbar">
            <section className="navbar-section text-white bg-[#334b35]">
                <div className="container mx-auto text-white">
                    <nav className="navbar-nav flex justify-between items-center mx-auto px-4 h-24">
                        <div className="navbar-logo" onClick={handleLogoClick}> {/* Use the function */}
                            <img id="logo" src="/src/assets/Logo-smartagri.png" alt="Smart Agri Logo" className="w-[200px] h-auto relative" />
                        </div>
                    </nav>
                </div>
            </section>
        </div>
    );
};

export default Navbar;