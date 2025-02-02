import { useNavigate } from "react-router-dom";
import Navbar from "../components/navbar";
import { useEffect } from "react";
import axios from "axios";
import CartComponent from "../components/cart";
import Chatbot from "./chatPage";

export default function CartPage(){
    const navigate = useNavigate();

    useEffect(() =>{
        async function check (){
            const token = localStorage.getItem("token");
            if(token){
                try{
                    const response = await axios.get('http://localhost:3000/api/auth', {
                        headers: {
                            Authorization: token,
                        },
                    });         
                }
                catch(err){
                    console.log(err);
                    navigate("/login"); 
                    return;
                }
            }
            else{
                navigate("/login"); 
            }
        }
        check();
    }, []);

    return (
        <>
            <Navbar></Navbar>
            <CartComponent></CartComponent>
            {/* <Chatbot></Chatbot> */}
        </>
    )
}