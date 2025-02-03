import React from 'react';
import { Link } from 'react-router-dom'; 
import { AiOutlineClose, AiOutlineMenu } from 'react-icons/ai';

const Navbar = () => {
    const [navbarOpen, setNavbarOpen] = React.useState(false);
    const handleToggle = () => setNavbarOpen(!navbarOpen);

    React.useEffect(() => {
        setNavbarOpen(false);
    }, []);

    return (
        <div className="navbar">
            <section className="navbar-section text-white bg-[#364c38]">
                <div className="container mx-auto text-white">
                    <nav className="navbar-nav flex justify-between items-center mx-auto px-4 h-24">
                        <Link to="/" className="navbar-logo" onClick={() => {window.location.href = "/"; }}>
                            <img id="logo" src="/src/assets/Logo-smartagri.png" alt="Smart Agri Logo" className="w-[200px] h-auto relative" />
                        </Link>
                        <div className="hidden md:flex items-center justify-between flex-1 pl-8">
                            <ul className="flex space-x-4">
                                <li className="navbar-link">
                                    <a href="#" className="px-6 py-2 bg-[#f5c066] text-[#364c38] rounded-full hover:bg-gray-100 transition-colors font-bold"
                                    onClick={() => {window.location.href = "/logout"; }}>
                                        Logout
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
                        <div className={`fixed top-0 left-0 w-[60%] h-full backdrop-blur-md border-r border-[#90ee90]/20 ease-in-out duration-500 ${navbarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                            <ul className="pt-24 px-4 flex flex-col space-y-3">
                                <a className="navbar-logo mb-6" href="#">
                                    <img id="logo" src="/src/assets/Logo-smartagri.png" alt="Smart Agri Logo" className="w-[200px] h-auto relative" />
                                </a>
                                <li className="mt-4">
                                    <a href="#" className="block p-4 bg-[#f5c066] text-[#364c38] rounded-full text-center font-bold hover:bg-gray-100 transition-colors"
                                    onClick={() => {window.location.href = "/logout"; }}>
                                        Logout
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

export default Navbar;