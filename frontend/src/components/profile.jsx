import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function ProfileComponent(){
    const [isEditing, setIsEditing] = useState(false);

    const [stored_data, setSData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        age: '',
        contact_no: '',
    });

    const [data, setData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        age: '',
        contact_no: '',
    });

    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try{
                const token = localStorage.getItem('token');
                // console.log(token);
                const response = await axios.get('http://localhost:3000/api/profile', {
                    headers: {
                        Authorization: token,
                    },
                });
                
                // console.log(response.data)
                const new_data = {
                    first_name: response.data.first_name,
                    last_name: response.data.last_name,
                    age: response.data.age,
                    contact_no: response.data.contact_no,
                    email: response.data.email,
                };

                setData(new_data);
                setSData(new_data);
                
            } 

            catch(err){
                // console.log(err);
                localStorage.removeItem('token');
                navigate('/login');
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
        try{
            const token = localStorage.getItem('token');

            await axios.put('http://localhost:3000/api/profile', data, {
                headers: { 
                    Authorization: token 
                },
            });
            setIsEditing(false);
            setSData(data);

            alert("Profile updated succesfully");
        } 
        catch(err){
            // console.log(err);
            alert("Error updating profile");
            setData(stored_data); //fail hua to stored data de dunga
            setIsEditing(false);
        }
    };

    return (
        <div className="h-screen w-screen bg-gray-100 flex justfy-center items-center pt-12">
            <div className="container mx-auto max-w-lg p-5 bg-white shadow-lg rounded-lg overflow-y-auto">
                <h1 className="text-center text-2xl font-semibold text-black mb-3">
                    {isEditing ? 'Edit Profile' : 'Profile Details'}
                </h1>

                <div className="space-y-4">
                    {['first_name', 'last_name', 'email', 'age', 'contact_no'].map((field) => (
                        <div key={field}>
                            <label htmlFor={field} className="block text-sm font-medium text-black">
                                {field.replace('_', ' ').toUpperCase()}
                            </label>

                            <input
                                type={field === 'email' ? 'email' : field === 'age' ? 'number' : 'text'}
                                name={field} id={field} value={data[field]}

                                disabled = {!isEditing || field === 'email'} //mail edit ni hogi ab

                                onChange={handleChange}

                                className={`mt-1 w-full px-3 py-2 border ${
                                    isEditing && field !== 'email' ? 'border-gray-300' : 'border-gray-200'
                                } rounded-md shadow-sm focus:outline-none focus:ring focus:ring-indigo-300`}
                            />
                        </div>
                    ))}
                </div>


                <div className="flex justify-end mt-6">
                    {isEditing ? (
                        <>
                            <button onClick={() => {
                                setIsEditing(false);
                                setData(stored_data);
                            }} 
                            className="px-4 py-1.5 bg-red-500 text-white rounded-md mr-3 hover:bg-red-700 text-lg">
                                Cancel
                            </button>

                            <button onClick={Save} 
                            className="bg-[#1877F2] text-white py-1.5 px-4 rounded-md hover:bg-[#3D5AF1] focus:outline-none text-lg">
                                Save
                            </button>
                        </>
                    ) : (
                        <button onClick={() => setIsEditing(true)} 
                        className="bg-[#1877F2] text-white py-1.5 px-4 rounded-md hover:bg-[#3D5AF1] focus:outline-none text-lg">
                            Edit
                        </button>
                    )}
                </div>


            </div>
        </div>
    );
}
