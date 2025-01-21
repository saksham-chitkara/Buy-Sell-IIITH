import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function HistoryComponent() {
    const [loading, setLoading] = useState(true);
    const [curr_tab, setCurrTab] = useState('pending');
    const [pending_orders, setPendingOrders] = useState([]);
    const [items_bought, setBoughtItems] = useState([]);
    const [items_sold, setItemsSold] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem('token');

        axios
            .get('http://localhost:3000/api/history', {
                headers: {
                    Authorization: token,
                },
            })
            .then((res) => {
                const { pending_orders, items_bought, items_sold } = res.data;

                setPendingOrders(pending_orders);
                setBoughtItems(items_bought);
                setItemsSold(items_sold);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                alert('Failed to fetch the orders history.');
            });
    }, []);

    const regen_otp = async (orderId) => {
        try {
            const token = localStorage.getItem('token');

            const response = await axios.post(`http://localhost:3000/api/regenerate/${orderId}`, {},{
                    headers: {
                        Authorization: token,
                    },
                }
            );

            const new_otp = response.data.new_otp;
            // console.log(new_otp);

            setPendingOrders((prev_orders) =>
                prev_orders.map((order) =>
                    order.id === orderId ? { ...order, otp: new_otp } : order
                )
            );

            alert('OTP regenerated successfully!');
        } catch (err) {
            console.error(err);
            alert('Failed to regenerate OTP.');
        }
    };

    if (loading) {
        return <div>Loading....</div>;
    }

    const current_tab = () => {
        if (curr_tab === 'pending') {
            return pending_orders.length > 0 ? (
                pending_orders.map((order, index) => (
                    <div className="bg-white shadow-md rounded-lg p-4 my-4" key={index}>
                        <h3 className="text-xl font-semibold">Item: {order.name}</h3>
                        <p className="text-gray-700">Price: Rs {order.price}</p>
                        <p className="text-gray-700">Category: {order.category}</p>
                        <p className="text-gray-700">Vendor: {order.vendor}</p>
                        <p className="text-gray-700 flex justify-between items-center">
                            <span>
                                OTP: {order.otp || 'Not available'}
                            </span>

                            <button
                                className="text-blue-500 hover:text-blue-700"
                                onClick={() => regen_otp(order.id)}
                                title="Regenerate OTP"
                            >
                                <span
                                    className="material-symbols-outlined"
                                    style={{
                                        color: 'black',
                                        transform: 'translateY(4px)', 
                                    }}
                                >
                                    autorenew
                                </span>
                            </button>
                        </p>

                    </div>
                ))
            ) : (
                <div>
                    <div className="text-center mt-10">
                        <p className="text-gray-500 text-lg">No orders are pending</p>
                    </div>
                </div>
            );
        } 
        
        else if (curr_tab === 'purchased') {
            return items_bought.length > 0 ? (
                items_bought.map((item, index) => (
                    <div className="bg-white shadow-md rounded-lg p-4 my-4" key={index}>
                        <h3 className="text-xl font-semibold">Item: {item.name}</h3>
                        <p className="text-gray-700">Price: Rs {item.price}</p>
                        <p className="text-gray-700">Category: {item.category}</p>
                        <p className="text-gray-700">Vendor: {item.vendor}</p>
                    </div>
                ))
            ) : (
                <div>
                    <div className="text-center mt-10">
                        <p className="text-gray-500 text-lg">No items bought till now</p>
                    </div>
                </div>
            );
        } 
        
        else if (curr_tab === 'sold') {
            return items_sold.length > 0 ? (
                items_sold.map((item, index) => (
                    <div className="bg-white shadow-md rounded-lg p-4 my-4" key={index}>
                        <h3 className="text-xl font-semibold">Item: {item.name}</h3>
                        <p className="text-gray-700">Price: Rs {item.price}</p>
                        <p className="text-gray-700">Category: {item.category}</p>
                        <p className="text-gray-700">Buyer Name: {item.buyer}</p>
                    </div>
                ))
            ) : (
                <div>
                    <div className="text-center mt-10">
                        <p className="text-gray-500 text-lg">No items sold till now</p>
                    </div>
                </div>
            );
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <link
                rel="stylesheet"
                href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=autorenew"
            />
            <style>{`
                .material-symbols-outlined {
                    font-variation-settings:
                    'FILL' 0,
                    'wght' 400,
                    'GRAD' 0,
                    'opsz' 24;
                }
            `}</style>

            <h1 className="text-3xl font-bold mb-6 text-center">Orders History</h1>
            <div className="flex justify-center space-x-4 mb-6">
                <button
                    className={`px-4 py-2 rounded ${
                        curr_tab === 'pending'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-800'
                    }`}
                    onClick={() => setCurrTab('pending')}
                >
                    Pending Orders
                </button>
                <button
                    className={`px-4 py-2 rounded ${
                        curr_tab === 'purchased'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-800'
                    }`}
                    onClick={() => setCurrTab('purchased')}
                >
                    Purchased Items
                </button>
                <button
                    className={`px-4 py-2 rounded ${
                        curr_tab === 'sold'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-800'
                    }`}
                    onClick={() => setCurrTab('sold')}
                >
                    Sold Items
                </button>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>{current_tab()}</div>
        </div>
    );
}
