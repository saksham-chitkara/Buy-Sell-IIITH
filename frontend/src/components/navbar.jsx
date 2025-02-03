import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
    const [cartCount, setCartCount] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        axios.get('http://localhost:3000/api/cart/count', {
            headers: {
                Authorization: token
            },
        })
        .then((res) => {
            setCartCount(res.data.cart_count);
        })
        .catch((err) => {
            console.log(err);
        });
    }, []);

    function logout_func() {
        alert("Logged out successfully!");
        localStorage.removeItem("token");
        navigate("/login");
    }

    return (
        <div className="bg-[#080E20] p-3.5 fixed top-0 left-0 w-full z-20 shadow-md">
            <div className="flex space-x-4 justify-between">
                <div>
                    <button disabled className="pl-3 text-3xl text-white rounded-md focus:outline-none font-cursive">
                        CampusMart
                    </button>
                </div>

                <div className="flex space-x-4">
                    <div>
                        <a href="/profile">
                            <button className="bg-[#1877F2] text-white py-1.5 px-4 rounded-md hover:bg-[#3D5AF1] focus:outline-none text-lg">
                                Profile
                            </button>
                        </a>
                    </div>

                    <div>
                        <a href="/search">
                            <button className="bg-[#1877F2] text-white py-1.5 px-4 rounded-md hover:bg-[#3D5AF1] focus:outline-none text-lg">
                                Shop
                            </button>
                        </a>
                    </div>

                    <div>
                        <a href="/history">
                            <button className="bg-[#1877F2] text-white py-1.5 px-4 rounded-md hover:bg-[#3D5AF1] focus:outline-none text-lg">
                                Orders History
                            </button>
                        </a>
                    </div>

                    <div>
                        <a href="/deliver">
                            <button className="bg-[#1877F2] text-white py-1.5 px-4 rounded-md hover:bg-[#3D5AF1] focus:outline-none text-lg">
                                Deliver Items
                            </button>
                        </a>
                    </div>

                    <div className="relative">
                        <a href="/cart">
                            <button className="bg-[#1877F2] text-white pt-1.5 pb-1.5 px-4 rounded-md hover:bg-[#3D5AF1] focus:outline-none text-lg">
                                <ShoppingCartIcon />
                            </button>
                        </a>

                        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {cartCount}
                        </div>
                    </div>

                    <div>
                        <a href="/sell">
                            <button className="bg-[#1877F2] text-white py-1.5 px-4 rounded-md hover:bg-[#3D5AF1] focus:outline-none text-lg">
                                Sell an Item
                            </button>
                        </a>
                    </div>
                </div>

                <div>
                    <button onClick={logout_func} className="bg-red-500 text-white py-1.5 px-4 rounded-md hover:bg-red-700 focus:outline-none text-lg">
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
}
