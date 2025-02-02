import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function ItemComponent() {
    const { id } = useParams();
    const [item, setItem] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        axios
            .get(`http://localhost:3000/api/items/${id}`, {
                headers: {
                    Authorization: token,
                },
            })
            .then((res) => {
                setItem(res.data);
            })
            .catch((err) => {
                console.log(err);
            });
    }, []);

    const addToCart = () => {
        const token = localStorage.getItem('token');
        axios
            .post(
                'http://localhost:3000/api/cart',
                { item_id: id },
                {
                    headers: {
                        Authorization: token,
                    },
                }
            )
            .then(() => {
                location.reload();
                alert('Item added to cart!');
            })
            .catch((err) => {
                console.log(err);
            });
    };

    if (!item) {
        return <p>Loading...</p>;
    }

    return (
        <div className="h-screen w-screen flex flex-col md:flex-row items-start p-10 border bg-gray-100">
            <div className="flex flex-col items-center mt-20 p-10">
                <img
                    src={item.image.url}
                    alt={item.name}
                    className="w-[500px] h-[500px] object-cover rounded-lg shadow-md"
                />
            </div>

            <div
                className="flex flex-col h-[500px] space-y-6 ml-6 mt-20 p-10 pl-0"
            >
                <div>
                    <h1 className="text-3xl font-bold text-4xl">
                        {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
                    </h1>
                    <p className="text-2xl text-gray-700 mt-6">Rs {item.price}</p>
                </div>

                <div>
                    <p className="text-gray-700 text-xl">{item.description}</p>
                </div>

                <div>
                    <p className="text-gray-700 text-xl">
                        <span className="font-semibold">Category:</span> {item.category}
                    </p>
                </div>

                <div>
                    <p className="text-gray-700 text-xl mb-6">
                        <span className="font-semibold">Sold By:</span> {item.vendor}
                    </p>
                </div>

                <div>
                    <button
                        onClick={addToCart}
                        className="px-6 py-3 bg-blue-500 text-white text-xl font-semibold rounded-lg hover:bg-blue-600 w-full"
                    >
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>

    );
}
