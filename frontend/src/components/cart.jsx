import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function CartComponent() {
    const [loading, setLoading] = useState(true);
    const [cartItems, setCartItems] = useState([]);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        const token = localStorage.getItem('token');

        axios.get('http://localhost:3000/api/cart', {
            headers: { 
                Authorization: token
            },
        })
        .then((res) => {
            setCartItems(res.data.cart_items);
            find_total(res.data.cart_items);
            setLoading(false);
        })
        .catch((err) => {
            console.log(err);
        });

    }, []);

    const find_total = (items) => {
        let new_tot = 0;
        items.forEach((item) => {
            new_tot += item.price;
        });
        setTotal(new_tot);
    };

    const remove = async (itemId, price) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:3000/api/cart/${itemId}`, {
                headers: { 
                    Authorization: token
                },
            });
            setCartItems((prevItems) =>
                prevItems.filter((item) => item._id !== itemId)
            );
            setTotal(total - price);
            window.location.reload();
        } 
        catch(err) {
            console.log(err);
        }
    };

    const order = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.post("http://localhost:3000/api/cart/order", {}, {
                headers: { 
                    Authorization: token
                },
            });  

            alert('Order placed successfully!');
            setCartItems([]);
            setTotal(0);
        } 
        catch(err) {
            console.log(err);
            alert('Failed to place order.');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex justify-center items-center">
                <div className="w-12 h-12 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50">
                <p className="text-2xl font-semibold text-gray-600 mb-4">Your cart is empty</p>
                <p className="text-gray-500">Add some items to get started!</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-gray-50 py-8 px-4 pt-20">
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 mt-10">
                {/* Main cart section */}
                <div className="flex-grow">
                    <ul className="space-y-6">
                        {cartItems.map((item) => (
                            <li
                                key={item._id}
                                className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-white shadow-sm rounded-xl transition-all hover:shadow-md"
                            >
                                <img 
                                    src={item.image.url} 
                                    alt={item.name} 
                                    className="w-full sm:w-48 h-40 object-cover rounded-lg"
                                />

                                <div className="flex-grow space-y-2 text-center sm:text-left">
                                    <h3 className="font-semibold text-xl text-gray-800">{item.name}</h3>
                                    <p className="text-gray-700 text-lg font-medium">Rs {item.price.toLocaleString()}</p>
                                </div>

                                <button
                                    onClick={() => remove(item._id, item.price)}
                                    className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors w-full sm:w-auto"
                                >
                                    Remove
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Order summary sidebar */}
                <div className="w-full lg:w-80 h-fit">
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h2>
                        <div className="border-t pt-4">
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-gray-600">Total</span>
                                <span className="text-2xl font-bold text-gray-800">Rs {total.toLocaleString()}</span>
                            </div>
                            <button
                                onClick={order}
                                className="w-full px-6 py-3 bg-blue-600 text-white text-lg font-medium rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Place Order
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}