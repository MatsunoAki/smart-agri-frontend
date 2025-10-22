import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { db } from '../../../firebase';
import { doc, setDoc } from 'firebase/firestore';
import Logo from "../../assets/Logo-smartagri.png";
import FarmBackground from "../../assets/farm-background.jpg";
import 'react-phone-number-input/style.css';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import './Register.css'; // We will add styles here
import { FiAlertTriangle } from 'react-icons/fi'; // For the error box

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [phoneError, setPhoneError] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { signup } = useAuth();
    const navigate = useNavigate();

    const handlePhoneChange = (value) => {
        setPhoneNumber(value);
        if (value && !isValidPhoneNumber(value)) {
            setPhoneError("Please enter a valid phone number");
        } else {
            setPhoneError("");
        }
    }
        
    async function handleSubmit(e) {
        e.preventDefault();
        setError(''); // Clear old errors

        if (password !== confirmPassword) {
            return setError("Passwords do not match");
        }
        if (!phoneNumber || !isValidPhoneNumber(phoneNumber)) {
            return setError("Please enter a complete and valid phone number");
        }
        if (phoneError) { 
             return setError(phoneError);
        }

        try {
            setLoading(true);

            const userCredential = await signup(email, password);
            const user = userCredential.user;
            const userId = user.uid;

            await setDoc(doc(db, 'users', userId), {
                username: username,
                email: email,
                phoneNumber: phoneNumber,
                uid: userId,
                createdAt: new Date(), // Good practice to add a timestamp
            });
            navigate('/login', { 
                state: { message: 'Registration successful! Please sign in.' } 
            });

        } catch (error) {
            if (error.code === 'auth/email-already-in-use') {
                setError('This email address is already in use.');
            } else if (error.code === 'auth/weak-password') {
                setError('Password is too weak. Please use at least 6 characters.');
            } else {
                setError('Failed to create account. Please try again.');
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

            {/* Overlay */}
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
                    Create Account
                </h1>
                <p className="text-gray-200 pb-6 text-center">
                    Join Smart Agri-Irrigation today
                </p>

                {error && (
                    <div className="flex items-center gap-3 text-red-300 bg-red-500/20 border border-red-500/50 text-sm rounded-lg p-3 mb-4">
                        <FiAlertTriangle className="size-5 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        className="bg-black/20 text-white p-3 rounded-lg w-full 
                                   placeholder:text-gray-400
                                   focus:outline-none focus:ring-2 focus:ring-[#f5c066]"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Username"
                        required
                    />
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
                    
                    <div className="phone-input-wrapper">
                        <PhoneInput 
                            placeholder="Enter phone number"
                            value={phoneNumber}
                            onChange={handlePhoneChange}
                            defaultCountry="PH"
                            className="phone-input-control"
                        />
                         {phoneError && <p className="text-red-400 text-xs mt-1 ml-1">{phoneError}</p>}
                    </div>

                    <input
                        type="password"
                        className="bg-black/20 text-white p-3 rounded-lg w-full 
                                   placeholder:text-gray-400
                                   focus:outline-none focus:ring-2 focus:ring-[#f5c066]"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password (min. 6 characters)"
                        required
                    />
                    <input
                        type="password"
                        className="bg-black/20 text-white p-3 rounded-lg w-full 
                                   placeholder:text-gray-400
                                   focus:outline-none focus:ring-2 focus:ring-[#f5c066]"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm Password"
                        required
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-[#f5c066] text-[#334b35] rounded-full font-bold 
                                   hover:bg-[#e6ad48] hover:scale-[1.02] shadow-md
                                   transition-all duration-300 ease-in-out
                                   disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Creating Account...' : 'Register'}
                    </button>
                </form>

                <p className="text-gray-200 text-center mt-6">
                    Already have an account?{' '}
                    <Link to="/login" className="text-[#f5c066] hover:underline font-medium">
                        Sign in
                    </Link>
                </p>
            </main>
        </div>
    );
};

export default Register;