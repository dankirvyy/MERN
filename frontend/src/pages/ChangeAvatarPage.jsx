import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth.jsx';

function ChangeAvatarPage() {
    const { login } = useAuth(); // Get the 'login' function to update state
    const navigate = useNavigate();

    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            // Create a local URL to preview the image
            setPreview(URL.createObjectURL(selectedFile));
        } else {
            setFile(null);
            setPreview(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!file) {
            setError('Please select a file to upload.');
            return;
        }

        // 1. Create FormData
        const formData = new FormData();
        formData.append('avatar', file); // 'avatar' must match backend field name

        try {
            // 2. Get token
            const token = JSON.parse(localStorage.getItem('user'))?.token;
            
            // 3. Set config for 'multipart/form-data'
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            };

            // 4. Send POST request to the new endpoint
            const { data } = await axios.post(
                'http://localhost:5001/api/users/avatar', 
                formData, 
                config
            );
            
            // 5. Update global state with new user info
            login({ ...data, token });

            setSuccess('Avatar updated successfully!');
            
            // 6. Redirect back to profile
            setTimeout(() => {
                navigate('/my-profile');
            }, 1500);

        } catch (err) {
            setError(err.response?.data?.message || 'Upload failed. Please try again.');
        }
    };

    return (
        <div className="max-w-xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
            <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Change Profile Picture</h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">Upload a new avatar (JPG, PNG, GIF, max 2MB).</p>

                    {error && (
                        <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                            <strong className="font-bold">Upload Error: </strong>
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}
                    {success && (
                        <div className="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                            <span className="block sm:inline">{success}</span>
                        </div>
                    )}

                    <div className="mt-5">
                        <form onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="avatar" className="block text-sm font-medium text-gray-700">Select Image</label>
                                <input 
                                    type="file" 
                                    name="avatar" 
                                    id="avatar" 
                                    required 
                                    accept="image/png, image/jpeg, image/gif" 
                                    onChange={handleFileChange}
                                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                                />
                            </div>

                            {/* Image Preview */}
                            {preview && (
                                <div className="mt-4">
                                    <p className="text-sm font-medium text-gray-700">Image Preview:</p>
                                    <img src={preview} alt="Avatar preview" className="mt-2 h-32 w-32 rounded-full object-cover" />
                                </div>
                            )}

                            <div className="mt-6 flex items-center justify-end gap-x-6">
                                <Link to="/my-profile" className="text-sm font-semibold leading-6 text-gray-900">
                                    Cancel
                                </Link>
                                <button 
                                    type="submit" 
                                    className="inline-flex justify-center rounded-md border border-transparent bg-orange-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-orange-700"
                                >
                                    Upload Avatar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ChangeAvatarPage;