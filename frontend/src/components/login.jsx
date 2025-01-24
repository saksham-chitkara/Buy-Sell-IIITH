import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";

export default function LoginComponent() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [captchaToken, setCaptchaToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 200);

        return () => clearTimeout(timer);
    }, []);

    const navigate = useNavigate();

    const loginfn = async () => {
        if (email.length === 0 || password.length === 0) {
            setError('All fields are required!');
            return;
        }

        if (!captchaToken) {
            setError('Please complete the CAPTCHA.');
            return;
        }

        try {
            const response = await axios.post('http://localhost:3000/api/login', {
                email,
                password,
                captchaToken
            });
            setError('');
            const token = response.data.token;
            localStorage.setItem("token", response.data.token);
            navigate("/profile");
        } 
        
        catch (err) {
            console.log(err);
            setError('Invalid email or password. Please try again.');
        }
    }

    const loginWithCAS = async () => {
        try {
            const res = await axios.get('http://localhost:3000/api/cas-login');
            const casUrl = res.data.redirectUrl;
            window.location.href = casUrl;
        } 
        
        catch(err){
            console.log(err);
            setError('Failed to initiate CAS login.');
        }
    };
    
    const handleCasCallback = async () => {
        const urlParams = new URLSearchParams(window.location.search);
        const ticket = urlParams.get('ticket');
    
        if(ticket){
            try {
                const res = await axios.get(`http://localhost:3000/api/cas/callback?ticket=${ticket}`);
                const token = res.data.token;
    
                localStorage.setItem('token', token);
    
                navigate('/profile');
            } 
            
            catch(err){
                console.log(err);
                setError('Authentication failed.');
            }
        } 
    };
    
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        if(token){
            localStorage.setItem('token', token);
            navigate('/profile');
        }
    }, [navigate]);
    

    if(loading){
        return (
            <div> Loading... </div>
        );
    }

    return (
        <div className="flex h-screen">
            <div className="w-1/2 flex items-center justify-center bg-gray-100">
                <div className="relative mx-auto w-full max-w-md bg-white px-6 pt-10 pb-8 shadow-xl ring-1 ring-gray-900/5 sm:rounded-xl sm:px-10">
                    <div className="w-full">
                        <div className="text-center">
                            <h1 className="text-3xl font-semibold ">Login to your account</h1>
                        </div>

                        <div className="mt-5">
                            <div className="relative mt-6">
                                <input
                                    onChange={(e) => setEmail(e.target.value)}
                                    type="email"
                                    name="email"
                                    id="email"
                                    placeholder="Email"
                                    className="peer mt-1 w-full border-b-2  px-0 py-1  focus:outline-none"
                                />
                            </div>

                            <div className="relative mt-6">
                                <input
                                    onChange={(e) => setPassword(e.target.value)}
                                    type="password"
                                    name="password"
                                    id="password"
                                    placeholder="Password"
                                    className="peer mt-1 w-full border-b-2  px-0 py-1  focus:outline-none"
                                />
                            </div>

                            <div className="my-6 flex justify-center w-full">
                                <div className="w-full max-w-xs">
                                    <ReCAPTCHA
                                        sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                                        onChange={(token) => setCaptchaToken(token)}
                                        onExpired={() => setCaptchaToken(null)}
                                    />
                                </div>
                            </div>

                            <div className="my-6">
                                <button
                                    onClick={loginfn}
                                    className="w-full rounded-md bg-[#3D5AF1] px-3 py-1.5 text-white hover:bg-[#1877F2] focus:outline-none text-lg"
                                >
                                    Login
                                </button>
                            </div>

                            <div className="my-6">
                                <button
                                    onClick={loginWithCAS}
                                    className="w-full rounded-md bg-[#4CAF50] px-3 py-1.5 text-white hover:bg-[#45a049] focus:outline-none text-lg"
                                >
                                    Login with CAS
                                </button>
                            </div>

                            {error && (
                                <div className="text-red-600 text-center mt-4">
                                    {error}
                                </div>
                            )}

                            <p className="text-center text-sm text-gray-500">
                                Don't have an account yet?
                                <a
                                    href="/signup"
                                    className="font-semibold hover:underline text-gray-600 hover:underline focus:text-gray-800  focus:outline-none"
                                >
                                    {" "}
                                    Sign Up
                                </a>
                                .
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-[2px] bg-[#4C3BCF]"></div>

            <div className="w-1/2 flex items-center justify-center bg-[#080E20] text-white p-12 sm:p-16">
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