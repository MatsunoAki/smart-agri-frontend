import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import Logo from "../../assets/Logo-smartagri.png";
import FarmBackground from "../../assets/farm-background.jpg"; // ✅ local image import

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        try {
            setError('');
            setLoading(true);
            await login(email, password);
            navigate('/');
        } catch (error) {
            setError('Failed to sign in: ' + error.message);
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

            {/* Form Card */}
            <main className="relative z-20 w-11/12 max-w-md p-8 bg-[#334b35] rounded-2xl shadow-xl backdrop-blur-sm">
                <h1 className="text-white text-3xl font-bold pb-2">Welcome Back</h1>
                <p className="text-gray-200 pb-6">Sign in to your Smart Agri-Irrigation account</p>

                {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="email"
                        className="bg-[#263c28] text-white p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#f5c066]"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email address"
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

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-[#f5c066] text-[#334b35] rounded-full font-bold hover:bg-[#e6ad48] transition duration-300"
                    >
                        {loading ? 'Signing In...' : 'Login'}
                    </button>
                </form>

                <p className="text-gray-200 text-center mt-6">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-[#f5c066] hover:underline">
                        Register
                    </Link>
                </p>
            </main>
        </div>
    );
};

export default Login;
