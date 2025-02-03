import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function SearchItemsPage() {
    const [items, setItems] = useState([]); //ye display wale hain
    const [searched, setSearched] = useState("");
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [all_items, setAllItems] = useState([]); //isme saare store
    const [isLoading, setIsLoading] = useState(true);

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
            setIsLoading(false);
        }).catch((error) => {
            console.error("Error fetching items or categories:", error);
            setIsLoading(false);
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
        <div className="p-4 flex flex-col lg:flex-row"> 
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=search" />

            <div className="lg:w-1/6 lg:mr-6 mt-40">  
                <div className="border rounded-md p-4 shadow-md mb-6">
                    <h2 className="text-lg font-bold mb-3 text-gray-600">CATEGORIES</h2>
                    <div className="flex flex-col gap-2">
                        {categories.map((category) => (
                            <label key={category} className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    value={category}
                                    checked={selectedCategories.includes(category)}
                                    onChange={() => handleCategoryChange(category)}
                                />
                                <p>{category.charAt(0).toUpperCase() + category.slice(1)}</p>
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            <div className="w-full"> 
                <div className='flex justify-center'>        
                    <div className="flex items-center border rounded-md overflow-hidden shadow-md mb-6 mt-20 w-full lg:w-3/4">
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
                            <span className="material-symbols-outlined">
                                search
                            </span>
                        </button>
                    </div>
                </div>   

                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="w-12 h-12 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ml-10">
                        {items.map((item) => (
                            <div 
                                key={item.id}
                                className="border rounded-lg p-1 hover:shadow-lg cursor-pointer flex flex-col items-center aspect-w-1 aspect-h-1"
                            >
                                {item.image && (
                                    <div className="h-[300px] w-[390px] flex justify-center items-center overflow-hidden rounded-lg bg-gray-100">
                                        <img 
                                            src={item.image.url} 
                                            alt={item.name} 
                                            className="h-full w-full object-cover transform transition-transform duration-300 hover:scale-110"
                                            onClick={() => open_item_page(item.id)}
                                        />
                                    </div>
                                )}

                                <div className="flex flex-col justify-center items-center mt-1">
                                    <h3 
                                        className="font-bold text-lg text-center"
                                        onClick={() => open_item_page(item.id)}
                                    >
                                        {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
                                    </h3>
                                    <p className="text-gray-600">Rs {item.price}</p>
                                </div>
                            </div>
                        ))}

                        {items.length === 0 && (
                            <p className="text-center col-span-full text-gray-600">
                                No items match your search or filters.
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}