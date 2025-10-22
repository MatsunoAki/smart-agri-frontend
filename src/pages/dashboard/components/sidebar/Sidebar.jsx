import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../../../firebase'; 
import { useAuth } from '../../../../contexts/AuthContext'; 
import { IoMdMenu, IoMdClose } from "react-icons/io"; 
import {
  FiHome,
  FiHardDrive,
  FiBarChart2,
  FiLogOut
} from 'react-icons/fi';
import Logo from "/src/assets/Logo-smartagri.png";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false); 
  const navigate = useNavigate();
  const auth = getAuth();
  const [username, setUsername] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    const fetchUsername = async () => {
      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUsername(userSnap.data().username || "User");
        } else {
          console.warn("User document not found.");
        }
      } catch (error) {
        console.error("Error fetching username:", error);
      }
    };
    fetchUsername();
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/'); 
    } catch (error) {
      console.error("Logout failed:", error.message);
    }
  };

  const closeMenu = () => setIsOpen(false);

  const NavItem = ({ to, icon, label }) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 text-white p-3 rounded-lg transition font-medium ${
          isActive ? "bg-[#90ee90]/20" : "hover:bg-[#90ee90]/10"
        }`
      }
      onClick={closeMenu} 
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-6 right-4 z-50 text-white text-3xl md:hidden"
      >
        {isOpen ? <IoMdClose /> : <IoMdMenu />}
      </button>

      <div
        onClick={closeMenu}
        className={`fixed inset-0 bg-black/50 z-30 md:hidden transition-opacity duration-300
          ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}
        `}
      />

      <div className={`bg-[#263c28] w-64 h-screen p-5 flex flex-col fixed md:relative top-0 left-0 transition-transform duration-500 ease-in-out z-40 md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        <div>
          <div className="md:hidden flex justify-center mb-6 pt-5">
            <img src={Logo} alt="Smart Agri Logo" className="w-40 h-auto" />
          </div>
          
          <div className="text-white text-center mb-4">
            <p className="font-semibold text-lg">Welcome, {username || "User"}!</p>
          </div>
          
          <nav className="flex flex-col space-y-2">
            <NavItem to="/dashboard/home" label="Home" icon={<FiHome size={20} />} />
            <NavItem to="/dashboard/devices" label="Devices" icon={<FiHardDrive size={20} />} />
            <NavItem to="/dashboard/reports" label="Reports" icon={<FiBarChart2 size={20} />} />
          </nav>

          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-3 p-3 bg-[#f5c066] text-[#334b35] rounded-full text-center font-bold hover:bg-white transition-colors duration-300
                       w-full mt-8" 
          >
            <FiLogOut size={20} />
            <span>Logout</span>
          </button>
        </div>

      </div>
    </>
  );
};

export default Sidebar;