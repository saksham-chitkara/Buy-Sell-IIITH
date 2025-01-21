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
        <div className="bg-gray-800 p-4">
            <div className="flex space-x-4">
                <div>
                    <a href="/profile">
                        <button className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none">
                            Profile
                        </button>
                    </a>
                </div>

                <div>
                    <a href="/search">
                        <button className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none">
                            Search Items
                        </button>
                    </a>
                </div>

                <div>
                    <a href="/history">
                        <button className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none">
                            Orders History
                        </button>
                    </a>
                </div>

                <div>
                    <a href="/deliver">
                        <button className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none">
                            Deliver Items
                        </button>
                    </a>
                </div>

                <div>
                    <a href="/cart">
                        <button className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none">
                            My Cart
                        </button>
                    </a>
                </div>

                <div>
                    <a href="/sell">
                        <button className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none">
                            Sell an Item
                        </button>
                    </a>
                </div>

                <div>
                    <button onClick={logout_func}className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none">
                        Logout
                    </button>
                </div>

            </div>
        </div>
    );
}
