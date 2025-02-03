import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function DeliverItemsComponent(){
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState([]);
    const [otp, setOtp] = useState(''); 
    const [selected_order, setSelectedOrder] = useState(null); 

    useEffect(() => {
        const token = localStorage.getItem('token');

        axios.get('http://localhost:3000/api/orders/pending', {
            headers: { 
                Authorization:  token
            },
        })
        .then((res) => {
            // console.log(res.data.to_be_sent);
            setOrders(res.data.to_be_sent);
            setLoading(false);
        })
        .catch((err) => {
            console.log(err);
        });

    }, []);

    const comp_transac = async (orderId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`http://localhost:3000/api/orders/complete/${orderId}`, { entered_otp: otp }, { 
                    headers: { 
                        Authorization: token 
                    } 
                }
            );

            setOrders(orders.filter((order) => order.id !== orderId));
            setOtp(''); 
            setSelectedOrder(null);

            alert('Transaction completed successfully!');
        } 
        
        catch(err){
            console.log(err);
            alert('Failed to complete transaction!')
        }
    };

    if(loading){
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="w-12 h-12 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold mt-11 mb-12 text-center text-gray-800">Orders Received</h1>

            {orders.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                    <p className="text-xl text-gray-500 font-medium">No orders received yet!</p>
                </div>
            ) : (
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {orders.map((order) => (
                        <div key={order.id} className="bg-white shadow-lg rounded-2xl p-6 flex flex-col sm:flex-row gap-6 hover:shadow-xl transition-all duration-300 border border-gray-100">
                            <div className="w-full sm:w-48 h-48 flex-shrink-0">
                                <img 
                                    src={order.image.url} 
                                    alt={order.name} 
                                    className="w-full h-full object-cover rounded-xl shadow-md"
                                />
                            </div>

                            <div className="flex-1 space-y-4">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-800 mb-2">{order.name}</h3>
                                    <p className="text-lg">
                                        <span className="font-medium text-gray-700">Price:</span>
                                        <span className="text-green-600 font-semibold ml-2">Rs {order.price}</span>
                                    </p>
                                    <p className="text-lg">
                                        <span className="font-medium text-gray-700">Buyer:</span>
                                        <span className="text-gray-600 ml-2">{order.buyer}</span>
                                    </p>
                                </div>
                                
                                {selected_order === order.id ? (
                                    <div className="space-y-4 pt-4">
                                        <input 
                                            type="text"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            placeholder="Enter OTP"
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        />

                                        <div className="flex gap-3">
                                            <button 
                                                onClick={() => comp_transac(order.id)}
                                                className="flex-1 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-blue-700 active:bg-blue-800 transition-colors duration-150"
                                            >
                                                Complete Transaction
                                            </button>

                                            <button 
                                                onClick={() => setSelectedOrder(null)}
                                                className="px-5 py-2.5 text-gray-700 bg-gray-100 rounded-xl font-medium hover:bg-gray-200 active:bg-gray-300 transition-colors duration-150"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button 
                                        onClick={() => setSelectedOrder(order.id)} 
                                        className="w-full sm:w-auto mt-4 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-blue-700 active:bg-blue-800 transition-colors duration-150"
                                    >
                                        Complete Transaction
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}