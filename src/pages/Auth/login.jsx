import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

export default function Login() {
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
            navigate('/dashboard/home');
        } catch (error) {
            setError('Failed to sign in: ' + error.message);
        }
        setLoading(false);
    }

    return (
        <div className="w-screen h-screen flex justify-center items-center bg-cover bg-center bg-fixed">
            <div className="absolute inset-0 bg-black opacity-70 z-10"></div>
            <header className="absolute top-2 left-2 z-30">
                <Link to="/">
                    <img
                        id="logo"
                        src="/src/assets/Logo-smartagri.png"
                        alt="Smart Agri Logo"
                        className="w-48 h-auto"
                    />
                </Link>
            </header>
            <main className="relative z-20 w-11/12 max-w-sm p-10 bg-[#364c38] rounded-lg flex flex-col">
                <h1 className="text-white text-3xl pb-4">Sign in</h1>
                <p className="text-white pb-2">Sign in to access the Smart Agri-irrigation</p>
                
                {error && <div className="text-red-500 mb-4">{error}</div>}
                
                <form onSubmit={handleSubmit} className="w-full">
                    <div className="form-floating mb-3">
                        <input
                            type="email"
                            className="form-control bg-[#2a3e2c] text-white p-3 rounded mb-4 w-full"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email address - name@example.com"
                            required
                        />
                    </div>
                    <div className="form-floating">
                        <input
                            type="password"
                            className="form-control bg-[#2a3e2c] text-white p-3 rounded mb-4 w-full"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            required
                        />
                    </div>
                    <div className="row mb-4 flex justify-between">
                        <div className="col d-flex justify-center">
                            <div className="form-check">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="form2Example31"
                                    defaultChecked
                                />
                                <label
                                    className="form-check-label text-white p-3"
                                    htmlFor="form2Example31"
                                >
                                    Remember me
                                </label>
                            </div>
                        </div>
                        <div className="col">
                            <a href="#!" className="text-[#f5c066]">Forgot password?</a>
                        </div>
                    </div>
                    <div className="flex justify-center pb-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full px-6 py-2 bg-[#f5c066] text-[#364c38] rounded-full hover:bg-gray-100 transition-colors font-bold"
                        >
                            {loading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </div>
                    <div className="text-center">
                        <p className="text-white">
                            Not a member?{' '}
                            <Link to="/register" className="text-[#f5c066]">
                                Register
                            </Link>
                        </p>
                    </div>
                </form>
            </main>
        </div>
    );
}