import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginComponent(){
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(''); 

    const navigate = useNavigate();

    const loginfn = async () => {
        if(email.length == 0 || password.length == 0){
            setError('All fields are required!');  
            return;
        }

        try {
            const response = await axios.post('http://localhost:3000/api/login', {
                email,
                password
            });
            // console.log(response);
            setError(''); 
            const token = response.data.token;
            // console.log(token);
            localStorage.setItem("token", response.data.token);
            navigate("/profile");
        } 
        catch(err){
            console.log(err);
            setError('Invalid email or password. Please try again.');  
        }
    }
      

    return (
        <div className="relative mx-auto w-full max-w-md bg-white px-6 pt-10 pb-8 shadow-xl ring-1 ring-gray-900/5 sm:rounded-xl sm:px-10">
            <div className="w-full">

                <div className="text-center">
                    <h1 className="text-3xl font-semibold text-gray-900">Welcome to Buy, Sell @IIITH</h1>
                </div>

                <div className="mt-5">
                    <div className="relative mt-6">
                        <input onChange={(e) => {
                            setEmail(e.target.value);
                        }} type="email" name="email" id="email" placeholder="Email" className="peer mt-1 w-full border-b-2 border-gray-300 px-0 py-1 className focus:border-gray-500 focus:outline-none"/>
                    </div>

                    <div className="relative mt-6">
                        <input onChange={(e) => {
                            setPassword(e.target.value);
                        }} type="password" name="password" id="password" placeholder="Password" className="peer peer mt-1 w-full border-b-2 border-gray-300 px-0 py-1 className focus:border-gray-500 focus:outline-none" />
                    </div>

                    <div className="my-6">
                        <button onClick = { loginfn } className="w-full rounded-md bg-black px-3 py-4 text-white focus:bg-gray-600 focus:outline-none">Log in</button>
                    </div>
                    
                    {error && (
                        <div className="focus: text-red-600 text-center mt-4">
                            {error}
                        </div>
                    )}

                    <p className="text-center text-sm text-gray-500">Don't have an account yet?
                        <a href="/signup"
                            className="font-semibold text-gray-600 hover:underline focus:text-gray-800 focus:outline-none"> Sign Up
                        </a>.
                    </p>
                </div>
            </div>
        </div>
    );
}