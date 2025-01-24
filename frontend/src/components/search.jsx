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
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=search" />
            <style>{`
                .material-symbols-outlined {
                font-variation-settings:
                'FILL' 0,
                'wght' 400,
                'GRAD' 0,
                'opsz' 24
                }
            `}</style>

            <div className='flex justify-center'>        
                <div className="flex items-center border rounded-md overflow-hidden shadow-md mb-6 mt-20 w-1/2 ml-30">
                    <input type="text" placeholder="Search..." 
                        value={searched} 
                        onChange={(e) => {
                            setSearched(e.target.value);
                        }}
                        className="flex-1 p-2 outline-none"/>

                    <button
                        onClick={search}
                        className="p-2 pt-3"
                    >
                        <span class="material-symbols-outlined">
                            search
                        </span>
                    </button>
                </div>
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
