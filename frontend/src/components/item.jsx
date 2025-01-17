import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function ItemComponent(){
    const { id } = useParams();
    const [item, setItem] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        axios.get(`http://localhost:3000/api/items/${id}`,{
            headers: { 
                Authorization: token 
            },
        })
        .then((res) => {
            setItem(res.data);
            // console.log(res.data);
        })
        .catch((err) => {
            console.log(err)
        });

    }, []);

    const addToCart = () => {
        const token = localStorage.getItem('token');
        axios.post('http://localhost:3000/api/cart',
            { item_id: id },
            {
                headers: {
                    Authorization: token 
                },
            }
        )
        .then(() => {
            alert('Item added to cart!');
        })
        .catch((err) => {
            console.log(err);
        });
    };

    if(!item){
        return <p>Loading...</p>;
    }

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">{item.name}</h1>
            <p className="text-gray-700 mb-2">Price: Rs {item.price}</p>
            <p className="text-gray-700 mb-2">Category: {item.category}</p>
            <p className="text-gray-700 mb-2">Vendor: {item.vendor}</p>
            <p className="text-gray-700 mb-4">{item.description}</p>
            <button
                onClick={addToCart}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
                Add to Cart
            </button>
        </div>
    );
}
