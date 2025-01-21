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
            <div>Loading...</div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <h1 className="text-3xl font-bold mb-6 text-center">Pending Orders</h1>

            {orders.length === 0 ? (
                <div className="text-center mt-10">
                    <p className="text-gray-500 text-lg">No pending orders</p>
                </div>
            ) : (

                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'> 

                    {orders.map((order) => (
                        <div key={order.id} className="bg-white shadow-md rounded-lg p-4 my-4">

                            <h3 className="text-xl font-semibold">Item: {order.name}</h3>
                            <p className="text-gray-700">Price: Rs {order.price}</p>
                            <p className="text-gray-700">Buyer Name: {order.buyer}</p>
                            
                            {selected_order === order.id ? (

                                <div className="mt-4">
                                    <input type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        placeholder="Enter OTP"
                                        className="border border-gray-300 rounded px-4 py-2"
                                    />

                            
                                    <button onClick={() => comp_transac(order.id)}
                                        className="ml-4 bg-blue-600 text-white px-4 py-2 rounded"
                                    >
                                        Complete Transaction
                                    </button>

                                    <button onClick={() => setSelectedOrder(null)}
                                        className="ml-2 text-red-600 underline"
                                    >
                                        Cancel
                                    </button>

                                </div>

                            ) : (

                                <button onClick={() => setSelectedOrder(order.id)} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">
                                    Complete Transaction
                                </button>
                            )}
                        </div>
                    ))}

                </div>
            )}
        </div>
    );
}
