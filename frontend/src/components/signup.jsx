import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SignupComponent() {
    const [email, setEmail] = useState('');
    const [first_name, setFirstName] = useState('');
    const [last_name, setLastName] = useState('');
    const [age, setAge] = useState(0);
    const [contact_no, setContact] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const navigate = useNavigate();

    const signupfn = async () => {
        if(email.length === 0 || password.length === 0 || first_name.length === 0 || last_name.length === 0 || age.length === 0 || contact_no.length === 0){
            setError('All fields are required!');
            return;
        }

        try {
            const response = await axios.post('http://localhost:3000/api/signup', {
                first_name,
                last_name,
                email,
                age : Number (age),
                contact_no,
                password
            });
            // console.log(response);
            setError('');
            const token = response.data.token;
            // console.log(token);
            localStorage.setItem("token", response.data.token);
            alert("Successfully Signed In!");
            navigate("/profile");
        }
        
        catch(err){
            console.log(err);
            setError('Error occurred. Please try again.');
        }
    };

    return (
        // <div className="h-screen w-screen bg-gray-100 flex items-center justify-center">
            
        // </div>

        <div className="flex h-screen">

        <div className="w-1/2 flex items-center justify-center bg-gray-100">
        <div className="relative mt-10 mx-auto w-full max-w-md bg-white px-6 pt-10 pb-8 shadow-xl ring-1 ring-gray-900/5 sm:rounded-xl sm:px-10">
                <div className="w-full">
                    <div className="text-center">
                        <h1 className="text-3xl font-semibold text-gray-900">Create A New Account</h1>
                    </div>

                    <div className="mt-5">
                        <div className="relative mt-4">
                            <input onChange={(e) => setFirstName(e.target.value)} type="text" name="first_name" id="first_name" placeholder="First Name" className="peer peer mt-1 w-full border-b-2 border-gray-300 px-0 py-1 className focus:border-gray-500 focus:outline-none" />
                        </div>

                        <div className="relative mt-4">
                            <input onChange={(e) => setLastName(e.target.value)} type="text" name="last_name" id="last_name" placeholder="Last Name" className="peer peer mt-1 w-full border-b-2 border-gray-300 px-0 py-1 className focus:border-gray-500 focus:outline-none" />
                        </div>

                        <div className="relative mt-4">
                            <input onChange={(e) => setEmail(e.target.value)} type="email" name="email" id="email" placeholder="Email" className="peer peer mt-1 w-full border-b-2 border-gray-300 px-0 py-1 className focus:border-gray-500 focus:outline-none" />
                        </div>
                        
                        <div className="relative mt-4">
                            <input onChange={(e) => setAge(e.target.value)} type="number" name="age" id="age" placeholder="Age" className="peer peer mt-1 w-full border-b-2 border-gray-300 px-0 py-1 className focus:border-gray-500 focus:outline-none" />
                        </div>

                        <div className="relative mt-4">
                            <input onChange={(e) => setContact(e.target.value)} type="text" name="contact_no" id="contact_no" placeholder="Contact Number" className="peer peer mt-1 w-full border-b-2 border-gray-300 px-0 py-1 className focus:border-gray-500 focus:outline-none" />
                        
                        </div>

                        <div className="relative mt-4"> 
                            <input onChange={(e) => setPassword(e.target.value)} type="password" name="password" id="password" placeholder="Password" className="peer peer mt-1 w-full border-b-2 border-gray-300 px-0 py-1 className focus:border-gray-500 focus:outline-none" />
                        </div>

                        <div className="my-6">
                            <button onClick={signupfn} className="w-full rounded-md bg-[#3D5AF1] px-3 py-1.5 text-white hover:bg-[#1877F2] focus:bg-gray-600 focus:outline-none text-lg">Sign Up</button>
                        </div>

                        {error && (
                            <div className="text-red-600 text-center mt-4">
                                {error}
                            </div>
                        )}

                        <p className="text-center text-sm text-gray-500">
                            Already have an account? 
                            <a href="/login" className="font-semibold text-gray-600 hover:underline focus:text-gray-800 focus:outline-none"> Log In</a>.
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <div className="w-[2px] bg-[#4C3BCF]"></div>

        <div className="w-1/2 flex items-center justify-center bg-[#0A102E] text-white p-12 sm:p-16">
            <div className="max-w-lg text-center">
                <h1 className="text-6xl font-extrabold mb-6 font-serif text-[#4db1ff]">
                    CampusMart
                </h1>
                <p className="text-lg leading-relaxed tracking-wide text-white">
                    Join our marketplace to buy and sell goods within the IIITH community. 
                    Make safe and hassle-free transactions with people you trust.
                </p>
                <p className="mt-6 text-sm text-[#CECECE] leading-relaxed">
                    Your go-to platform for connecting with fellow students and finding what you need.
                </p>
            </div>
        </div>

        </div>
    );
}
