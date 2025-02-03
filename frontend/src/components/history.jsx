import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';

export default function HistoryComponent() {
    const [loading, setLoading] = useState(true);
    const [curr_tab, setCurrTab] = useState('pending');
    const [pending_orders, setPendingOrders] = useState([]);
    const [items_bought, setBoughtItems] = useState([]);
    const [items_sold, setItemsSold] = useState([]);
    const [reviews, setReviews] = useState({});

    const [reviewDialog, setReviewDialog] = useState(null);


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
                // console.log(items_bought);
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

            setPendingOrders((prev_orders) =>
                prev_orders.map((order) =>
                    order.id === orderId ? { ...order, otp: new_otp } : order
                )
            );

            alert('OTP regenerated successfully!');
        } 
        
        catch (err){
            console.error(err);
            alert('Failed to regenerate OTP.');
        }
    };


    // const handleReviewChange = (index, text) => {
    //     setReviews((prevReviews) => ({
    //         ...prevReviews,
    //         [index]: text,
    //     }));
    // };

    // const submitReview = async (sellerId, itemId, index) => {
    //     if (!reviews[index]) return;

    //     try {
    //         console.log("hi")
    //         console.log(sellerId);
    //         console.log("hi2");
    //         console.log(itemId);
    //         // console.log(reviews[value]);
    //         const token = localStorage.getItem('token');

    //         await axios.post("http://localhost:3000/api/review", {
    //             sellerId,
    //             itemId,
    //             text: reviews[index]
    //         }, { 
    //             headers: { 
    //                 Authorization: token 
    //             } 
    //         });
    //         alert("Review submitted successfully!");
    //         setReviews((prevReviews) => ({ ...prevReviews, [index]: "" }));
    //     } 
        
    //     catch(err){
    //         alert("Failed to submit review");
    //     }
    // };

    const handleReviewChange = (text) => {
        setReviewDialog((prev) => ({ ...prev, text }));
    };

    const openReviewDialog = (sellerId, itemId, index) => {
        setReviewDialog({ sellerId, itemId, index, text: reviews[index] || '' });
    };

    const closeReviewDialog = () => {
        if (reviewDialog) {
            setReviews((prevReviews) => ({ ...prevReviews, [reviewDialog.index]: null }));
        }
        setReviewDialog(null);
    };

    const submitReview = async () => {
        if (!reviewDialog?.text) return;
        try {
            const token = localStorage.getItem('token');
            await axios.post("http://localhost:3000/api/review", {
                sellerId: reviewDialog.sellerId,
                itemId: reviewDialog.itemId,
                text: reviewDialog.text
            }, { 
                headers: { Authorization: token }
            });
            alert("Review submitted successfully!");
            setReviews((prevReviews) => ({ ...prevReviews, [reviewDialog.index]: "" }));
            setReviewDialog(null);
        } catch (err) {
            alert("Failed to submit review");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex justify-center items-center">
                <div className="w-12 h-12 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
            </div>
        );
    }

    const current_tab = () => {
        if (curr_tab === 'pending') {
            return pending_orders.length > 0 ? (
                <div className='grid grid-cols-2 gap-4'>
                    {pending_orders.map((order, index) => (
                        <div className="bg-white shadow-lg rounded-xl p-6 my-6 flex items-start w-full hover:shadow-xl transition-shadow duration-300" key={index}>
                            <div className="w-64 h-64 flex-shrink-0">
                                <img src={order.image.url} alt={order.name} className="w-full h-full object-cover rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300" />
                            </div>
                            <div className="flex-1 space-y-4 pl-8">
                                <h3 className="text-2xl font-bold text-gray-800">{order.name}</h3>
                                <p className="text-lg text-gray-700"><span className="font-semibold">Price:</span> <span className="text-green-600">Rs {order.price}</span></p>
                                <p className="text-lg text-gray-700"><span className="font-semibold">Category:</span> {order.category}</p>
                                <p className="text-lg text-gray-700"><span className="font-semibold">Vendor:</span> {order.vendor}</p>
                                <div className="flex items-center justify-between mt-4 bg-gray-50 p-3 rounded-lg">
                                    <p className="text-xl flex items-center">
                                        <span className="font-bold min-w-[100px]">OTP:</span>
                                        <span className="text-red-600 font-mono font-bold">{order.otp || 'Not available'}</span>
                                    </p>
                                    <button className="ml-4 p-2 rounded-full hover:bg-gray-200 transition-colors duration-200" onClick={() => regen_otp(order.id)}>
                                        <span className="material-symbols-outlined" style={{ color: 'black' }}>autorenew</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className='w-full flex justify-center'>
                    <p className="text-gray-500 text-lg text-center">No orders are pending</p>
                </div>
            );
        } else if (curr_tab === 'purchased') {
            // return items_bought.length > 0 ? (
                // <div className='grid grid-cols-2 gap-4'>
                    {/* {items_bought.map((item, index) => (
                        <div className="bg-white shadow-lg rounded-xl p-6 my-6 flex items-start w-full hover:shadow-xl transition-shadow duration-300" key={index}>
                            <div className="flex flex-col items-center">
                                <img src={item.image.url} alt={item.name} className="w-[250px] h-[200px] object-cover rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300" />
                            </div>
                            <div className="flex-1 space-y-4 pl-12">
                                <h3 className="text-2xl font-bold text-gray-800">{item.name}</h3>
                                <p className="text-lg text-gray-700"><span className="font-semibold">Price:</span> <span className="text-green-600">Rs {item.price}</span></p>
                                <p className="text-lg text-gray-700"><span className="font-semibold">Category:</span> {item.category}</p>
                                <p className="text-lg text-gray-700"><span className="font-semibold">Vendor:</span> {item.vendor}</p>
                            </div>
                        </div>
                    ))} */}

                //     {items_bought.map((item, index) => (
                //         <div
                //             className="bg-white shadow-lg rounded-xl p-6 my-6 flex items-start w-full hover:shadow-xl transition-shadow duration-300"
                //             key={index}
                //         >
                //             <div className="flex flex-col items-center">
                //                 <img
                //                     src={item.image.url}
                //                     alt={item.name}
                //                     className="w-[250px] h-[200px] object-cover rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                //                 />
                //             </div>
                //             <div className="flex-1 space-y-4 pl-12">
                //                 <h3 className="text-2xl font-bold text-gray-800">{item.name}</h3>
                //                 <p className="text-lg text-gray-700">
                //                     <span className="font-semibold">Price:</span> <span className="text-green-600">Rs {item.price}</span>
                //                 </p>
                //                 <p className="text-lg text-gray-700">
                //                     <span className="font-semibold">Category:</span> {item.category}
                //                 </p>
                //                 <p className="text-lg text-gray-700">
                //                     <span className="font-semibold">Vendor:</span> {item.vendor}
                //                 </p>
                //                 <textarea
                //                     className="w-full p-2 border rounded-md"
                //                     placeholder="Write your review here..."
                //                     value={reviews[index] || ""}
                //                     onChange={(e) => handleReviewChange(index, e.target.value)}
                //                 ></textarea>
                //                 <button
                //                     className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                //                     onClick={() => submitReview(item.sellerId, item.itemId, index)}
                //                 >
                //                     Submit Review
                //                 </button>
                //             </div>
                //         </div>
                //     ))}
                // </div>
            
                return items_bought.length > 0 ? (
                    <div className='grid grid-cols-2 gap-4'>
                        {items_bought.map((item, index) => (
                            <div
                                className="bg-white shadow-lg rounded-xl p-6 my-6 flex items-start w-full hover:shadow-xl transition-shadow duration-300"
                                key={index}
                            >
                                <div className="flex flex-col items-center">
                                    <img
                                        src={item.image.url}
                                        alt={item.name}
                                        className="w-[250px] h-[225px] object-cover rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                                    />
                                </div>
                                <div className="flex-1 space-y-4 pl-12">
                                    <h3 className="text-2xl font-bold text-gray-800">{item.name}</h3>
                                    <p className="text-lg text-gray-700">
                                        <span className="font-semibold">Price:</span> <span className="text-green-600">Rs {item.price}</span>
                                    </p>
                                    <p className="text-lg text-gray-700">
                                        <span className="font-semibold">Category:</span> {item.category}
                                    </p>
                                    <p className="text-lg text-gray-700">
                                        <span className="font-semibold">Vendor:</span> {item.vendor}
                                    </p>
                                    <button
                                        className="mt-2 flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                        onClick={() => openReviewDialog(item.sellerId, item.itemId, index)}
                                    >

                                        <FontAwesomeIcon icon={faEdit} className="mr-2" /> Write a Review
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

            ) : (
                <div className='w-full flex justify-center'>
                    <p className="text-gray-500 text-lg text-center">No items purchased till now</p>
                </div>
            );
        } else if (curr_tab === 'sold') {
            return items_sold.length > 0 ? (
                <div className='grid grid-cols-2 gap-4'>
                    {items_sold.map((item, index) => (
                        <div className="bg-white shadow-lg rounded-xl p-8 my-6 flex items-start w-full hover:shadow-xl transition-shadow duration-300" key={index}>
                            <div className="flex flex-col items-center">
                                <img src={item.image.url} alt={item.name} className="w-[250px] h-[200px] object-cover rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300" />
                            </div>
                            <div className="flex-1 space-y-4 pl-12">
                                <h3 className="text-3xl font-bold text-gray-800">{item.name}</h3>
                                <p className="text-lg text-gray-700"><span className="font-semibold">Price:</span> <span className="text-green-600">Rs {item.price}</span></p>
                                <p className="text-lg text-gray-700"><span className="font-semibold">Category:</span> {item.category}</p>
                                <p className="text-lg text-gray-700"><span className="font-semibold">Buyer:</span> {item.buyer}</p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className='w-full flex justify-center'>
                    <p className="text-gray-500 text-lg text-center">No items sold till now</p>
                </div>
            );
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-20">
            <link
                rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=autorenew"
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
    
            <div className="flex justify-center space-x-4 mb-6 mt-5">
                <button
                    className={`bg-[#1877F2] text-white py-1.5 px-4 rounded-md hover:bg-[#3D5AF1] focus:outline-none text-lg ${
                        curr_tab === 'pending'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-800'
                    }`}
                    onClick={() => setCurrTab('pending')}
                >
                    Pending Orders
                </button>
                <button
                    className={`bg-[#1877F2] text-white py-1.5 px-4 rounded-md hover:bg-[#3D5AF1] focus:outline-none text-lg ${
                        curr_tab === 'purchased'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-300 text-gray-800'
                    }`}
                    onClick={() => setCurrTab('purchased')}
                >
                    Purchased Items
                </button>
                <button
                    className={`bg-[#1877F2] text-white py-1.5 px-4 rounded-md hover:bg-[#3D5AF1] focus:outline-none text-lg ${
                        curr_tab === 'sold'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-300 text-gray-800'
                    }`}
                    onClick={() => setCurrTab('sold')}
                >
                    Sold Items
                </button>
            </div>
            {current_tab()}

            {reviewDialog && (
                <div className="bg-gray-100 p-20">
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white p-6 rounded-lg shadow-xl w-[500px] max-w-full max-h-[80vh] overflow-hidden">
                            <h2 className="text-xl font-bold mb-4">Write a Review</h2>

                            <textarea
                                className="w-full p-2 border rounded-md h-40 resize-none"
                                placeholder="Enter your review..."
                                value={reviewDialog.text}
                                onChange={(e) => handleReviewChange(e.target.value)}
                            ></textarea>

                            <div className="flex justify-end space-x-4 mt-4">
                                <button
                                    className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500"
                                    onClick={closeReviewDialog}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                                    onClick={submitReview}
                                >
                                    Submit
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}