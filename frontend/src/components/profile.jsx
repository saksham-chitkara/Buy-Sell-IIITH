import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';

export default function ProfileComponent() {
    const [isEditing, setIsEditing] = useState(false);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [showReviews, setShowReviews] = useState(false);

    const [stored_data, setSData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        age: '',
        contact_no: '',
        password: ''
    });

    const [data, setData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        age: '',
        contact_no: '',
        password: ''
    });

    const fetchReviews = async (token) => {
        try {
            const response = await fetch('http://localhost:3000/api/profile/reviews', {
                headers: { Authorization: token }
            });
            const data = await response.json();
            setReviews(data.reviews);
        } catch (err) {
            console.error('Error fetching reviews:', err);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const profileResponse = await fetch('http://localhost:3000/api/profile', {
                    headers: { Authorization: token },
                });
                
                if (!profileResponse.ok) {
                    throw new Error('Failed to fetch profile');
                }

                const profileData = await profileResponse.json();
                const new_data = {
                    first_name: profileData.first_name,
                    last_name: profileData.last_name,
                    age: profileData.age,
                    contact_no: profileData.contact_no,
                    email: profileData.email,
                    password: profileData.password
                };

                setData(new_data);
                setSData(new_data);
                await fetchReviews(token);
            } catch (err) {
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
        };

        fetchData();
    }, []);

    const handleChange = (e) => {
        setData({
            ...data,
            [e.target.name]: e.target.value,
        });
    };

    const Save = async () => {
        try {
            const token = localStorage.getItem('token');
            if (data.password) data.password.trim();

            const response = await fetch('http://localhost:3000/api/profile', {
                method: 'PUT',
                headers: { 
                    Authorization: token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error('Failed to update profile');
            }

            setIsEditing(false);
            setSData({ ...data, password: null });
            setData({ ...data, password: null });

            alert("Profile updated successfully");
        } catch (err) {
            console.log(err);
            alert("Error updating profile");
            setData(stored_data);
            setIsEditing(false);
        }
    };

    return (
        <div className="h-screen w-screen bg-blue-50 flex justify-center items-center pt-12 overflow-hidden pl-60">
            <div className={`flex gap-6 transition-all duration-300 ease-in-out relative pl-20 ml-20
                ${showReviews ? 'transform -translate-x-[20%]' : 'transform translate-x-0'}`}>
                
                {/* Profile Section */}
                <div className="w-[550px] bg-white shadow-lg rounded-lg p-5 ml-40">
                    <h1 className="text-center text-2xl font-semibold text-black mb-3">
                        {isEditing ? 'Edit Profile' : 'Profile Details'}
                    </h1>

                    <div className="space-y-4">
                        {['first_name', 'last_name', 'email', 'password', 'age', 'contact_no'].map((field) => (
                            <div key={field} className="relative">
                                <label htmlFor={field} className="block text-sm font-medium text-black">
                                    {field.replace('_', ' ').toUpperCase()}
                                </label>

                                {field === 'password' ? (
                                    <>
                                        <input
                                            onChange={handleChange}
                                            value={data[field] || ''}
                                            type={passwordVisible ? "text" : "password"}
                                            disabled={!isEditing}
                                            name="password"
                                            id="password"
                                            placeholder="Password"
                                            className="mt-1 w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring focus:ring-indigo-300"
                                        />

                                        {isEditing && (
                                            <span
                                                className="absolute right-2 top-1/2 transform -translate-y-1 cursor-pointer"
                                                onClick={() => setPasswordVisible(!passwordVisible)}
                                            >
                                                {passwordVisible ? (
                                                    <Eye className="w-5 h-5 text-gray-500" />
                                                ) : (
                                                    <EyeOff className="w-5 h-5 text-gray-500" />
                                                )}
                                            </span>
                                        )}
                                    </>
                                ) : (
                                    <input
                                        type={field === 'email' ? 'email' : field === 'age' ? 'number' : 'text'}
                                        name={field}
                                        id={field}
                                        value={data[field]}
                                        disabled={!isEditing || field === 'email'}
                                        onChange={handleChange}
                                        className={`mt-1 w-full px-3 py-2 border ${
                                            isEditing && field !== 'email' ? 'border-gray-300' : 'border-gray-200'
                                        } rounded-md shadow-sm focus:outline-none focus:ring focus:ring-indigo-300`}
                                    />
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end mt-6">
                        {isEditing ? (
                            <>
                                <button
                                    onClick={() => {
                                        setIsEditing(false);
                                        setData(stored_data);
                                    }}
                                    className="px-4 py-1.5 bg-red-500 text-white rounded-md mr-3 hover:bg-red-700 text-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={Save}
                                    className="bg-[#1877F2] text-white py-1.5 px-4 rounded-md hover:bg-[#3D5AF1] focus:outline-none text-lg"
                                >
                                    Save
                                </button>
                            </>
                        ) : (
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="bg-[#1877F2] text-white py-1.5 px-4 rounded-md hover:bg-[#3D5AF1] focus:outline-none text-lg"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => setShowReviews(true)}
                                    className="bg-green-600 text-white py-1.5 px-4 rounded-md hover:bg-green-700 focus:outline-none text-lg"
                                >
                                    Reviews
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Reviews Section */}
                <div className={`w-[550px] bg-white shadow-lg rounded-lg p-5 transition-all duration-300 ease-in-out 
                    ${showReviews ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full pointer-events-none'}`}>
                    <div className="flex justify-between items-center mb-3">
                        <h1 className="text-2xl font-semibold text-black">
                            Reviews
                        </h1>
                        <button 
                            onClick={() => setShowReviews(false)}
                            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X className="w-6 h-6 text-gray-600" />
                        </button>
                    </div>
                    <div className="space-y-4 max-h-[600px] overflow-y-auto">
                        {reviews && reviews.length > 0 ? (
                            reviews.map((review, index) => (
                                <div key={index} className="bg-gray-50 p-4 rounded-lg shadow hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-bold text-lg text-gray-800">
                                            {review.reviewerId.first_name} {review.reviewerId.last_name}
                                        </span>
                                        <span className="text-sm text-gray-600">
                                            Item: {review.itemId.name}
                                        </span>
                                    </div>
                                    <p className="text-gray-700">{review.text}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-500">No reviews yet</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}