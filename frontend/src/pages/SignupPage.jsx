import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';

function SignupPage() {
    // State for all form fields
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // State for password visibility
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // State for errors
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null); // Clear previous errors

        // Client-side password match check
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            await axios.post('http://localhost:5001/api/auth/register', {
                first_name: firstName,
                last_name: lastName,
                email,
                password,
            });
            // Redirect to login after successful signup
            // We could also pass a "success" message
            navigate('/login'); 
        } catch (err) {
            // Handle single or multiple error messages
            const errData = err.response?.data;
            if (errData && errData.errors) {
                // If backend sends an error array like in your PHP
                setError(errData.errors.map(e => e.msg).join(', '));
            } else if (errData && errData.message) {
                // For single error messages
                setError(errData.message);
            } else {
                setError('An unknown error occurred.');
            }
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

            {/* Signup Form Box */}
            <div className="relative z-10 w-full max-w-md space-y-8 bg-white/90 backdrop-blur-sm shadow-2xl rounded-2xl p-8 sm:p-10">
                <div>
                    <Link to="/" className="flex items-center justify-center gap-3 text-3xl font-bold tracking-tight text-orange-600 hover:text-orange-700">
                        <img className="h-10 w-auto" src="/logo.png" alt="Visit Mindoro Logo" />
                        <span>Visit Mindoro</span>
                    </Link>
                    <h2 className="mt-6 text-2xl font-bold tracking-tight text-gray-900">Create a new account</h2>
                </div>

                {/* Error Message (Replaces PHP) */}
                {error && (
                    <div className="rounded-md bg-red-50 p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <FontAwesomeIcon icon={faExclamationCircle} className="h-5 w-5 text-red-400" />
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">There was an error with your submission</h3>
                                <div className="mt-2 text-sm text-red-700">
                                    {/* This can be a list if you send back an array */}
                                    <p>{error}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                        <div>
                            <label htmlFor="first_name" className="block text-sm font-medium leading-6 text-gray-900">First Name</label>
                            <div className="mt-2">
                                <input
                                    id="first_name"
                                    name="first_name"
                                    type="text"
                                    required
                                    className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-orange-600 sm:text-sm sm:leading-6"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="last_name" className="block text-sm font-medium leading-6 text-gray-900">Last Name</label>
                            <div className="mt-2">
                                <input
                                    id="last_name"
                                    name="last_name"
                                    type="text"
                                    required
                                    className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-orange-600 sm:text-sm sm:leading-6"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">Email address</label>
                        <div className="mt-2">
                            <input
                                id="email"
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
                        <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">Password</label>
                        <div className="mt-2 relative">
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                required
                                className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-orange-600 sm:text-sm sm:leading-6"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
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
                        <label htmlFor="password_confirm" className="block text-sm font-medium leading-6 text-gray-900">Confirm Password</label>
                        <div className="mt-2 relative">
                            <input
                                id="password_confirm"
                                name="password_confirm"
                                type={showConfirmPassword ? 'text' : 'password'}
                                required
                                className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-orange-600 sm:text-sm sm:leading-6"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5">
                                <span 
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                                    className="cursor-pointer text-gray-500 hover:text-gray-700"
                                >
                                    <FontAwesomeIcon icon={showConfirmPassword ? faEye : faEyeSlash} className="h-5 w-5" />
                                </span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <button type="submit" className="flex w-full justify-center rounded-md bg-orange-600 py-2.5 px-3 text-sm font-semibold text-white shadow-sm hover:bg-orange-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600">
                            Create Account
                        </button>
                    </div>
                </form>
                
                <p className="mt-2 text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link to="/login" className="font-medium text-orange-600 hover:text-orange-500">Sign in here</Link>
                </p>
                
                <p className="mt-10 text-center text-sm text-gray-700">
                    <Link to="/" className="font-medium text-orange-600 hover:text-orange-500">&larr; Back to Home</Link>
                </p>
            </div>
        </div>
    );
}

export default SignupPage;