import React, { useEffect } from "react";
import SignupComponent from "../components/signup";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function SignupPage(){
    const navigate = useNavigate();

    useEffect(() =>{
        async function check (){
            const token = localStorage.getItem("token");
            // console.log(token);
            if(token){
                try{
                    const response = await axios.get('http://localhost:3000/api/auth', {
                        headers: {
                            Authorization: token,
                        },
                    });
                    navigate("/profile"); 
                }
                catch(err){
                    console.log(err);
                    return;
                }
            }
        }
        check();
    }, []);

    return (
        <SignupComponent></SignupComponent>
    );
}
