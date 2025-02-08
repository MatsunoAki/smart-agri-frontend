import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AiOutlineClose, AiOutlineMenu } from 'react-icons/ai';

const Navbar = () => {
    const [navbarOpen, setNavbarOpen] = React.useState(false);
    const handleToggle = () => setNavbarOpen(!navbarOpen);
    const navigate = useNavigate();

    React.useEffect(() => {
        setNavbarOpen(false);
    }, []);

    const handleLogoClick = () => {
        navigate('/dashboard/home'); 
        window.location.reload(); // Force reload after navigation
    };

    const handleLogoutClick = () => {
      navigate('/logout'); // Use navigate for route change
      window.location.reload(); // Force reload after navigation
    };


    return (
        <div className="navbar">
            <section className="navbar-section text-white bg-[#364c38]">
                <div className="container mx-auto text-white">
                    <nav className="navbar-nav flex justify-between items-center mx-auto px-4 h-24">
                        <div className="navbar-logo" onClick={handleLogoClick}> {/* Use the function */}
                            <img id="logo" src="/src/assets/Logo-smartagri.png" alt="Smart Agri Logo" className="w-[200px] h-auto relative" />
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
                                <div className="navbar-logo mb-6" onClick={handleLogoClick}> {/* Use the function here too */}
                                    <img id="logo" src="/src/assets/Logo-smartagri.png" alt="Smart Agri Logo" className="w-[200px] h-auto relative" />
                                </div>
                                <li className="mt-4">
                                    <div className="block p-4 bg-[#f5c066] text-[#364c38] rounded-full text-center font-bold hover:bg-gray-100 transition-colors"
                                      onClick={handleLogoutClick}> {/* Use the function here */}
                                        Logout
                                    </div>
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