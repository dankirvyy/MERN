import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash, faExclamationCircle, faCheckCircle } from '@fortawesome/free-solid-svg-icons';

import { useAuth } from '../hooks/useAuth.jsx';

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null); 
    const navigate = useNavigate();

    const { login } = useAuth(); // 2. GET THE login FUNCTION FROM CONTEXT

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        try {
            const response = await axios.post('http://localhost:5001/api/auth/login', {
                email,
                password,
            });

            // 3. USE THE CONTEXT login FUNCTION
            // This will update localStorage AND the global state
            login(response.data); 
            
            console.log('Login response:', response.data); // Debug
            console.log('User role:', response.data.role); // Debug
            
            // Redirect based on user role
            if (response.data.role === 'admin') {
                console.log('Redirecting to admin dashboard'); // Debug
                navigate('/admin/dashboard');
            } else {
                console.log('Redirecting to home'); // Debug
                navigate('/');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred.');
        }
    };

    // This is the background image from your HTML
    const backgroundImageUrl = 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80';

    return (
        <div className="relative flex min-h-screen items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-800">
            {/* Background Image */}
            <img 
                className="absolute inset-0 h-full w-full object-cover" 
                src={backgroundImageUrl} 
                alt="Mindoro Beach"
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-gray-900/60 mix-blend-multiply" aria-hidden="true"></div>

            {/* Login Form Box */}
            <div className="relative z-10 w-full max-w-md space-y-8 bg-white/90 backdrop-blur-sm shadow-2xl rounded-2xl p-8 sm:p-10">
                <div>
                    <Link to="/" className="flex items-center justify-center gap-3 text-3xl font-bold tracking-tight text-orange-600 hover:text-orange-700">
                        {/* We moved logo.png to frontend/public/logo.png */}
                        <img className="h-10 w-auto" src="/logo.png" alt="Visit Mindoro Logo" />
                        <span>Visit Mindoro</span>
                    </Link>
                    <h2 className="mt-6 text-2xl font-bold tracking-tight text-gray-900">Sign in to your account</h2>
                </div>

                {/* Error Message (Replaces PHP) */}
                {error && (
                    <div className="rounded-md bg-red-50 p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <FontAwesomeIcon icon={faExclamationCircle} className="h-5 w-5 text-red-400" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-red-800">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Success Message (Replaces PHP) */}
                {success && (
                    <div className="rounded-md bg-green-50 p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <FontAwesomeIcon icon={faCheckCircle} className="h-5 w-5 text-green-400" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-green-800">{success}</p>
                            </div>
                        </div>
                    </div>
                )}

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">Email address</label>
                        <div className="mt-2">
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-orange-600 sm:text-sm sm:leading-6"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between">
                            <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">Password</label>
                            <div className="text-sm">
                                <Link to="/forgot-password" className="font-medium text-orange-600 hover:text-orange-500">Forgot password?</Link>
                            </div>
                        </div>
                        <div className="mt-2 relative">
                            <input
                                id="password"
                                name="password"
                                // Use React state to toggle password type
                                type={showPassword ? 'text' : 'password'}
                                autoComplete="current-password"
                                required
                                className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-orange-600 sm:text-sm sm:leading-6"
                                placeholder="Your Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            {/* Password Toggle Button (Replaces JS) */}
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5">
                                <span 
                                    onClick={() => setShowPassword(!showPassword)} 
                                    className="cursor-pointer text-gray-500 hover:text-gray-700"
                                >
                                    <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} className="h-5 w-5" />
                                </span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <button type="submit" className="flex w-full justify-center rounded-md bg-orange-600 py-2.5 px-3 text-sm font-semibold text-white shadow-sm hover:bg-orange-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600">
                            Sign in
                        </button>
                    </div>
                </form>
                
                <div className="relative">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="w-full border-t border-gray-400"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="bg-white/90 px-2 text-gray-500">Or continue with</span>
                    </div>
                </div>

                <div>
                    {/* This <a> tag points to your eventual backend Google route. We haven't built this yet. */}
                    <a 
                        href="http://localhost:5001/api/auth/google-login" // This should be the backend API route
                        className="flex w-full items-center justify-center rounded-md bg-white py-2.5 px-4 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    >
                        {/* Google SVG from your HTML */}
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48px" height="48px"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.902,36.098,44,30.638,44,24C44,22.659,43.862,21.35,43.611,20.083z"/></svg>
                        <span className="ml-3">Sign in with Google</span>
                    </a>
                </div>
                
                <p className="mt-2 text-sm text-gray-600">
                    No account yet?{' '}
                    <Link to="/signup" className="font-medium text-orange-600 hover:text-orange-500">Sign up here</Link>
                </p>

                <p className="mt-8 text-center text-sm text-gray-700">
                    <Link to="/" className="font-medium text-orange-600 hover:text-orange-500">&larr; Back to Home</Link>
                </p>
            </div>
        </div>
    );
}

export default LoginPage;