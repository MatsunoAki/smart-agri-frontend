import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import Logo from "../../assets/Logo-smartagri.png";
import FarmBackground from "../../assets/farm-background.jpg";
// I've added an icon for the error message
import { FiAlertTriangle } from 'react-icons/fi';

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
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                setError('Invalid email or password. Please try again.');
            } else {
                setError('Failed to sign in. Please try again later.');
            }
        }
        setLoading(false);
    }

    return (
        <div className="w-screen h-screen flex justify-center items-center overflow-hidden">
            <img
                src={FarmBackground}
                alt="A farm field"
                loading="eager"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover z-0"
            />

            <div className="absolute inset-0 bg-black/50 z-10"></div>

            {/* Form Card */}
            <main 
              className="relative z-20 w-11/12 max-w-md p-8 
                         bg-black/30 backdrop-blur-lg rounded-2xl shadow-xl 
                         border border-white/10"
            >
                <Link to="/" className="flex justify-center mb-6">
                    <img src={Logo} alt="Smart Agri Logo" className="w-48 h-auto" />
                </Link>

                <h1 className="text-white text-3xl font-bold pb-2 text-center">
                    Welcome Back
                </h1>
                <p className="text-gray-200 pb-6 text-center">
                    Sign in to your account
                </p>

                {error && (
                    <div className="flex items-center gap-3 text-red-300 bg-red-500/20 border border-red-500/50 text-sm rounded-lg p-3 mb-4">
                        <FiAlertTriangle className="size-5 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="email"
                        className="bg-black/20 text-white p-3 rounded-lg w-full 
                                   placeholder:text-gray-400
                                   focus:outline-none focus:ring-2 focus:ring-[#f5c066]"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email address"
                        required
                    />
                    <input
                        type="password"
                        className="bg-black/20 text-white p-3 rounded-lg w-full 
                                   placeholder:text-gray-400
                                   focus:outline-none focus:ring-2 focus:ring-[#f5c066]"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        required
                    />

                    <div className="text-right">
                       <Link to="/forgot-password" className="text-sm text-gray-300 hover:text-[#f5c066] hover:underline">
                            Forgot Password?
                       </Link>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-[#f5c066] text-[#334b35] rounded-full font-bold 
                                   hover:bg-[#e6ad48] hover:scale-[1.02] shadow-md
                                   transition-all duration-300 ease-in-out
                                   disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Signing In...' : 'Login'}
                    </button>
                </form>

                <p className="text-gray-200 text-center mt-6">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-[#f5c066] hover:underline font-medium">
                        Register
                    </Link>
                </p>
            </main>
        </div>
    );
};

export default Login;