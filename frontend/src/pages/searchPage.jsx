import { useNavigate } from "react-router-dom";
import Navbar from "../components/navbar";
import SearchItemsPage from "../components/search";
import { useEffect } from "react";
import axios from "axios";

export default function SearchPage(){
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
            <SearchItemsPage></SearchItemsPage>
        </>
    )
}