import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function SellComponent(){
    const [itemData, setItemData] = useState({
        name: '',
        price: '',
        description: '',
        category: '',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const update = (e) => {
        const { name, value } = e.target;
        setItemData({
            ...itemData,
            [name]: value,
        });
    };

    const submit = async () => {
        setIsSubmitting(true);
        try {
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
            });

        } 
        
        catch(err){
            console.error(err);
            alert('Error selling item');
        }

        setIsSubmitting(false);
    };

    return(
        <div className="container mx-auto max-w-lg p-5 bg-white shadow-lg rounded-lg mt-10">
            <h1 className="text-center text-lg font-semibold text-gray-700 mb-3">
                Sell an Item
            </h1>

            <div className="space-y-4">
                {['name', 'price', 'description'].map((field) => (
                    <div key={field}>
                        <label htmlFor={field} className="block text-sm font-medium text-gray-700">
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
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">
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

            <div className="flex justify-end mt-6">
                <button
                    onClick={submit}
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300"
                >
                    {isSubmitting ? 'Submitting...' : 'Sell Item'}
                </button>
            </div>
        </div>
    );
}
