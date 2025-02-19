import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import { db } from '../../../../../firebase'; // Firestore import
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../../../../contexts/AuthContext';
import { IoMdMenu, IoMdClose } from "react-icons/io";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [username, setUsername] = useState('');
  const navigate = useNavigate();
  const auth = getAuth();
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

  return (
    <>
      {/* Mobile Menu Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-8 right-4 z-50 text-white text-3xl md:hidden"
      >
        {isOpen ? <IoMdClose /> : <IoMdMenu />}
      </button>

      {/* Sidebar */}
      <div className={`bg-[#263c28] w-64 h-screen p-5 flex flex-col justify-between fixed md:relative top-0 left-0 transition-transform duration-500 ease-in-out z-40 md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Navigation Links */}
        <nav className="flex flex-col space-y-2">
          <div className="md:hidden flex justify-center mb-9">
            <img src="/src/assets/Logo-smartagri.png" alt="Smart Agri Logo" className="w-50 h-auto" />
          </div>

          {/* Username Display */}
          <div className="text-white text-center mb-4">
            <p className="font-semibold text-lg">Welcome, {username}!</p>
          </div>

          {/* Sidebar Links */}
          {[
            { path: "/dashboard/home", label: "Home" },
            { path: "/dashboard/devices", label: "Devices" },
            { path: "/dashboard/reports", label: "Reports" },
            { path: "/dashboard/settings", label: "Settings" },
            { path: "/dashboard/notifications", label: "Notifications" },
          ].map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `text-white p-4 rounded transition font-medium ${
                  isActive ? "bg-[#3a4e3c]" : "hover:bg-[#3a4e3c]"
                }`
              }
              onClick={() => setIsOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="block p-4 bg-[#f5c066] text-[#364c38] rounded-full text-center font-bold hover:bg-gray-100 transition-colors"
          >
            Logout
          </button>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
