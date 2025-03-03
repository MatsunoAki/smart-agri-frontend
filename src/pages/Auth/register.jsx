import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { getDatabase, ref, set, push } from 'firebase/database';
import { db } from '../../../firebase'; // Import Firestore
import { doc, setDoc } from 'firebase/firestore'; // Firestore methods
import Logo from "../../assets/Logo-smartagri.png";

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { signup } = useAuth();
    const navigate = useNavigate();
    const database = getDatabase();

    // Handle user registration and database entry
    async function handleSubmit(e) {
        e.preventDefault();

        // Check if passwords match
        if (password !== confirmPassword) {
            return setError("Passwords do not match");
        }

        try {
            setError('');
            setLoading(true);

            // Register user in Firebase Authentication
            const userCredential = await signup(email, password);
            const user = userCredential.user;
            const userId = user.uid;


            // Add user to Realtime Database                    
            await setDoc(doc(db, 'users', userId), {
                username: username,
                email: email,
                password: password,
            });

            // Add delay before navigating to login page
            setTimeout(() => {
                navigate('/login');
            }, 1000);  // 1-second delay

        } catch (error) {
            setError('Failed to create account: ' + error.message);
        }
        setLoading(false);
    }

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
                        src={Logo}
                        alt="Smart Agri Logo"
                        className="w-48 h-auto"
                    />
                </Link>
            </header>
            <main className="relative z-20 w-11/12 max-w-sm p-10 bg-[#334b35] rounded-lg flex flex-col">
                <h1 className="text-white text-3xl pb-4">Register</h1>
                <p className="text-white pb-2">
                    Create an account to access the Smart Agri-irrigation
                </p>
                
                {error && <div className="text-red-500 mb-4 text-sm">{error}</div>}
                
                <form onSubmit={handleSubmit} className="w-full">
                    <div className="form-floating mb-3">
                        <input
                            type="text"
                            className="form-control bg-[#263c28] text-white p-3 rounded mb-4 w-full"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Username"
                            required
                        />
                    </div>
                    <div className="form-floating mb-3">
                        <input
                            type="email"
                            className="form-control bg-[#263c28] text-white p-3 rounded mb-4 w-full"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email address - name@example.com"
                            required
                        />
                    </div>
                    <div className="form-floating mb-3">
                        <input
                            type="password"
                            className="form-control bg-[#263c28] text-white p-3 rounded mb-4 w-full"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            required
                        />
                    </div>
                    <div className="form-floating mb-3">
                        <input
                            type="password"
                            className="form-control bg-[#263c28] text-white p-3 rounded mb-4 w-full"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm Password"
                            required
                        />
                    </div>
                    <div className="flex justify-center pb-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full px-6 py-2 bg-[#f5c066] text-[#364c38] rounded-full hover:bg-gray-300 transition-colors font-bold"
                        >
                            {loading ? 'Creating Account...' : 'Register'}
                        </button>
                    </div>
                    <div className="text-center">
                        <p className="text-white">
                            Already a member?{' '}
                            <Link to="/login" className="text-[#f5c066]">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default Register;

