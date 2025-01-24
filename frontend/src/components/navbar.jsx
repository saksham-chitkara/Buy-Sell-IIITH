import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Navbar(){
    const navigate = useNavigate();

    function logout_func(){
        alert("Logged out successfully!");
        localStorage.removeItem("token");
        navigate("/login");
    }

    return (
        <div className="bg-[#080E20] p-3.5 fixed top-0 left-0 w-full z-20 shadow-md">   
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=shopping_cart" />
            <style>{`
                .material-symbols-outlined {
                font-variation-settings:
                'FILL' 0,
                'wght' 400,
                'GRAD' 0,
                'opsz' 24
                }
            `}</style>
            
            <div className="flex space-x-4 justify-between">
                <div>
                    <button  disabled className="pl-3 text-3xl text-white rounded-md focus:outline-none font-cursive">
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
                                Search Items
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

                    <div>
                        <a href="/cart">
                            <button className="bg-[#1877F2] text-white pt-2 pb-0.5 px-4 rounded-md hover:bg-[#3D5AF1] focus:outline-none text-lg">
                            <span className="material-symbols-outlined">
                                shopping_cart
                            </span>
                            </button>
                        </a>
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
                    <button onClick={logout_func}className="bg-red-500 text-white py-1.5 px-4 rounded-md hover:bg-red-700 focus:outline-none text-lg">
                        Logout
                    </button>
                </div>

            </div>
        </div>
    );
}
