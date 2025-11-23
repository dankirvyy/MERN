import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth.jsx'; // We'll use this!

function EditProfilePage() {
    const { user, login } = useAuth(); // Get the user and the 'login' function
    const navigate = useNavigate();

    // Set initial form state from the logged-in user
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState(''); // Added email to state
    const [phoneNumber, setPhoneNumber] = useState('');

    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // When the component loads, pre-fill the form
    useEffect(() => {
        if (user) {
            // Split the full name back into first and last
            const nameParts = user.name.split(' ');
            setFirstName(nameParts[0] || '');
            setLastName(nameParts.slice(1).join(' ') || '');
            setEmail(user.email || '');
            setPhoneNumber(user.phone_number || '');
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        try {
            // Get token from localStorage
            const token = JSON.parse(sessionStorage.getItem('user'))?.token;
            
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            };

            const body = {
                first_name: firstName,
                last_name: lastName,
                email: email, // Send the updated email
                phone_number: phoneNumber
            };

            // Send the PUT request to our updated backend route
            const { data } = await axios.put('http://localhost:5001/api/users/profile', body, config);

            // Update our global state with the new user data
            login({ ...data, token }); // Re-add the token

            setSuccess('Profile updated successfully!');
            
            // Redirect back to the profile page
            setTimeout(() => {
                navigate('/my-profile');
            }, 1500);

        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile.');
        }
    };

    return (
        <div className="max-w-xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
            <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Edit Your Profile</h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">Update your personal information.</p>

                    <div className="mt-5">
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 gap-6">

                                {error && <div className="p-3 bg-red-100 text-red-700 rounded">{error}</div>}
                                {success && <div className="p-3 bg-green-100 text-green-700 rounded">{success}</div>}

                                <div>
                                    <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">First Name</label>
                                    <input
                                        type="text"
                                        name="first_name"
                                        id="first_name"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        required
                                        className="mt-1 block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-orange-600 sm:text-sm"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">Last Name</label>
                                    <input
                                        type="text"
                                        name="last_name"
                                        id="last_name"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        required
                                        className="mt-1 block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-orange-600 sm:text-sm"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        id="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="mt-1 block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-orange-600 sm:text-sm"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">Phone Number</label>
                                    <input
                                        type="text"
                                        name="phone_number"
                                        id="phone_number"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        className="mt-1 block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-orange-600 sm:text-sm"
                                        placeholder="09123456789"
                                    />
                                </div>
                            </div>
                            <div className="mt-6 flex items-center justify-end gap-x-6">
                                <Link to="/my-profile" className="text-sm font-semibold leading-6 text-gray-900">
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    className="inline-flex justify-center rounded-md border border-transparent bg-orange-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-orange-700"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EditProfilePage;