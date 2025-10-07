import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { getDatabase } from 'firebase/database';
import { db } from '../../../firebase';
import { doc, setDoc } from 'firebase/firestore';
import Logo from "../../assets/Logo-smartagri.png";
import FarmBackground from "../../assets/farm-background.jpg"; // ✅ Import local image

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

    async function handleSubmit(e) {
        e.preventDefault();

        if (password !== confirmPassword) {
            return setError("Passwords do not match");
        }

        try {
            setError('');
            setLoading(true);

            const userCredential = await signup(email, password);
            const user = userCredential.user;
            const userId = user.uid;

            await setDoc(doc(db, 'users', userId), {
                username,
                email,
                password
            });

            setTimeout(() => {
                navigate('/login');
            }, 1000);

        } catch (error) {
            setError('Failed to create account: ' + error.message);
        }
        setLoading(false);
    }

    return (
        <div
            className="w-screen h-screen flex justify-center items-center bg-cover bg-center bg-fixed"
            style={{ backgroundImage: `url(${FarmBackground})` }}
        >
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/70 z-10"></div>

            {/* Logo */}
            <header className="absolute top-4 left-4 z-30">
                <Link to="/">
                    <img src={Logo} alt="Smart Agri Logo" className="w-40 md:w-48 h-auto drop-shadow-lg" />
                </Link>
            </header>

            {/* Form */}
            <main className="relative z-20 w-11/12 max-w-md p-8 bg-[#334b35] rounded-2xl shadow-xl backdrop-blur-sm">
                <h1 className="text-white text-3xl font-bold pb-2">Create Account</h1>
                <p className="text-gray-200 pb-6">Join Smart Agri-Irrigation today</p>

                {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        className="bg-[#263c28] text-white p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#f5c066]"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Username"
                        required
                    />
                    <input
                        type="email"
                        className="bg-[#263c28] text-white p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#f5c066]"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email address - name@example.com"
                        required
                    />
                    <input
                        type="password"
                        className="bg-[#263c28] text-white p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#f5c066]"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        required
                    />
                    <input
                        type="password"
                        className="bg-[#263c28] text-white p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#f5c066]"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm Password"
                        required
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-[#f5c066] text-[#334b35] rounded-full font-bold hover:bg-[#e6ad48] transition duration-300"
                    >
                        {loading ? 'Creating Account...' : 'Register'}
                    </button>
                </form>

                <p className="text-gray-200 text-center mt-6">
                    Already have an account?{' '}
                    <Link to="/login" className="text-[#f5c066] hover:underline">
                        Sign in
                    </Link>
                </p>
            </main>
        </div>
    );
};

export default Register;
