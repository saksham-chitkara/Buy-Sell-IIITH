import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function CartComponent(){
    const [loading, setLoading] = useState(true);
    const [cartItems, setCartItems] = useState([]);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        const token = localStorage.getItem('token');

        axios.get('http://localhost:3000/api/cart', {
            headers: { 
                Authorization:  token
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
        var new_tot = 0;
        items.map((item) => {
            new_tot += item.price;
        })
        setTotal(new_tot);
    };

    const remove = async (itemId, price) => {
        try{
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:3000/api/cart/${itemId}`,{
                headers: { 
                    Authorization: token
                },
            });
            setCartItems((prevItems) =>
                prevItems.filter((item) => item._id !== itemId)
            );
            const tot = total - price;
            setTotal(tot);
        } 
        catch(err){
            console.log(err);
        }
    };

    const order = async () => {
        try{
            const token = localStorage.getItem('token');
            console.log(token);
            await axios.post("http://localhost:3000/api/cart/order",{}, {
                headers: { 
                    Authorization: token
                },
            });  

            alert('Order placed successfully!');
            setCartItems([]);
            setTotal(0);
        } 

        catch(err){
            console.log(err);
            alert('Failed to place order.');
        }
    };

    if(loading){
        return(
            <p>Loading........</p>
        )
    }

    return (
        <div className="h-screen w-screen bg-gray-100 flex justfy-center pt-12">

        <div className="p-6">
            <div className="text-2xl font-bold mb-4 pt-3">My Cart</div>

            {cartItems.length === 0 ? (
                <p>Your cart is empty.</p>
            ) : (
                <div>
                    <ul className="mb-4">
                        {cartItems.map((item) => (
                            <li
                                key={item._id}
                                className="flex justify-between items-center mb-2 border-b pb-2"
                            >
                                <div>
                                    <p className="font-semibold">{item.name}</p>
                                    <p className="text-gray-700">Rs {item.price}</p>
                                </div>

                                <button
                                    onClick={() => remove(item._id, item.price)}
                                    className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                >
                                    Remove
                                </button>
                            </li>
                        ))}
                    </ul>

                    <div className="flex justify-between items-center mb-4">
                        <p className="font-bold">Total: </p>
                        <p className="font-bold text-lg">Rs {total}</p>
                    </div>

                    <button
                        onClick={order}
                        className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Final Order
                    </button>
                </div>
            )}
        </div>
        </div>
    );
}
