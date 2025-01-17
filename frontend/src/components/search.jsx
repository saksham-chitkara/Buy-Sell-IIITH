import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function SearchItemsPage() {
    const [items, setItems] = useState([]); //ye display wale hain
    const [searched, setSearched] = useState("");
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [all_items, setAllItems] = useState([]); //isme saare store

    const navigate = useNavigate();
    const categories = ["grocery", "sports", "academics", "clothing", "others"];


    useEffect(() => {
        const token = localStorage.getItem("token");
        axios.get('http://localhost:3000/api/items', {
            headers: {
                Authorization: token
            }
        }).then((res) => {
            setAllItems(res.data.items);
            setItems(res.data.items);
        }).catch((error) => {
            console.error("Error fetching items or categories:", error);
        });

    }, []);

    const handleCategoryChange = (category) => {
        setSelectedCategories((prevSelected) =>
        prevSelected.includes(category)
            ? prevSelected.filter((cat) => cat !== category)
            : [...prevSelected, category]
        );
    };

    const search = () => {
        const filtered_items = all_items.filter((item) => {
            const name_matched = searched.length > 0 ? item.name.toLowerCase().includes(searched.toLowerCase()) : true;
            const cat_matched = selectedCategories.length > 0 ? selectedCategories.some((category) => item.category === category) : true;
    
            return name_matched && cat_matched;
        });
                
        setItems(filtered_items);
    }
   

    const open_item_page = (itemId) => {
        navigate(`/item/${itemId}`);
    };

    return(
        <div className="p-4">            
            <div className="flex items-center border rounded-md overflow-hidden shadow-md mb-6">
                <input type="text" placeholder="Search..." 
                    value={searched} 
                    onChange={(e) => {
                        setSearched(e.target.value);
                    }}
                    className="flex-1 p-2 outline-none"/>
                
                <button
                    onClick={search}
                    className="p-2 bg-orange-400 hover:bg-orange-500 text-white"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="currentColor"
                        className="w-5 h-5"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M21 21l-4.35-4.35m-1.15-4.65a7.5 7.5 0 11-15 0 7.5 7.5 0 0115 0z"
                        />
                    </svg>
                </button>
            </div>

            <div className="mb-4">
                <h2 className="text-lg font-semibold mb-2">Filter by Categories</h2>
                <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                        <label key={category} className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            value={category}
                            checked={selectedCategories.includes(category)}
                            onChange={() => handleCategoryChange(category)}
                        />
                        <p>{category}</p>
                        </label>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((item) => (
                    <div key={item.id}
                        className="border rounded-md p-4 hover:shadow-lg cursor-pointer"
                        onClick={() =>open_item_page(item.id)}
                    >
                        <h3 className="font-bold">{item.name}</h3>
                        <p>Price: {item.price}</p>
                        <p>Category: {item.category}</p>
                        <p>Description: {item.description}</p>
                        <p>Vendor: {item.vendor}</p>
                    </div>
                ))}
                
                {items.length === 0 && (
                    <p className="text-center col-span-full text-gray-600">
                        No items match your search or filters.
                    </p>
                )}
            </div>
        </div>
    );
}
