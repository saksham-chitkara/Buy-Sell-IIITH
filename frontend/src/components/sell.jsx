import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function SellComponent(){
    const [itemData, setItemData] = useState({
        name: '',
        price: '',
        description: '',
        category: '',
        image:' '
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef(null); // Add a reference for the file input
    const navigate = useNavigate();

    const update = (e) => {
        const { name, value } = e.target;
        setItemData({
            ...itemData,
            [name]: value,
        });
    };

    const handleImage = (e) =>{
        const file = e.target.files[0];
        setFileToBase(file);
        console.log(file);
    }

    const setFileToBase = (file) =>{
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onloadend = () => {
            console.log("Base64 string generated:", reader.result);
            setItemData({
                ...itemData,
                image: reader.result, // Assign base64 to image key
            });
        };

        reader.onerror = (error) => {
            console.error("Error reading file:", error);
        };
    }

    const submit = async () => {
        setIsSubmitting(true);
        try {

            if(!itemData.name || !itemData.description || !itemData.price || !itemData.category || !itemData.image){
                alert("Please fill all the details");
                setIsSubmitting(false);
                return;
            }

            const token = localStorage.getItem('token');
            console.log(itemData);
            const response = await axios.put('http://localhost:3000/api/sell', itemData, {
                headers: {
                    Authorization: token,
                },
            });

            alert(response.data.msg);

            setItemData({
                name: '',
                price: '',
                description: '',
                category: '',
                image: '', // Clear the image in state
            });

            if (fileInputRef.current) {
                fileInputRef.current.value = ''; // Reset the file input value
            }

        } 
        
        catch(err){
            console.error(err);
            alert('Error selling item');
        }

        setIsSubmitting(false);
    };

    return(
        <div className="h-screen w-screen bg-gray-100 flex justfy-center items-center pt-8">
            <div className="container mx-auto max-w-lg p-5 bg-white shadow-lg rounded-lg mt-10">
                <h1 className="text-center text-2xl font-bold text-black mb-3">
                    Sell an Item
                </h1>

                <div className="space-y-4">
                    {['name', 'price', 'description'].map((field) => (
                        <div key={field}>
                            <label htmlFor={field} className="block text-sm font-medium text-black">
                                {field.replace('_', ' ').toUpperCase()}
                            </label>

                            <input
                                type={field === 'price' ? 'number' : 'text'}
                                name={field}
                                id={field}
                                value={itemData[field]}
                                onChange={update}
                                required
                                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-indigo-300"
                            />
                        </div>
                    ))}

                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-black">
                            CATEGORY
                        </label>
                        <select
                            name="category"
                            id="category"
                            value={itemData.category}
                            onChange={update}
                            required
                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-indigo-300"
                        >
                            <option value="">Select a category</option>
                            <option value="clothing">Clothing</option>
                            <option value="grocery">Grocery</option>
                            <option value="academics">Academics</option>
                            <option value="sports">Sports</option>
                            <option value="others">Others</option>
                        </select>
                    </div>
                </div>

                <div className="form-outline mt-6">
                    <input 
                        ref={fileInputRef} // Attach the ref to the file input
                        onChange={handleImage} 
                        type="file" 
                        id="formupload" 
                        name="image" 
                        className="form-control rounded pl-0.5"  
                    />
                </div>

                <div className="flex justify-end mt-6">
                    <button
                        onClick={submit}
                        disabled={isSubmitting}
                        className="bg-[#1877F2] text-white py-1.5 px-4 rounded-md hover:bg-[#3D5AF1] focus:outline-none text-lg"
                    >
                        {isSubmitting ? 'Submitting...' : 'Sell Item'}
                    </button>
                </div>
            </div>
        </div>
    );
}
