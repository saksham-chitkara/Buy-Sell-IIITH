import jwt from "jsonwebtoken";
import { jwtpass } from "../index.js";

function jwt_auth(req, res, next){
    const token = req.headers.authorization;

    if(!token){
        return res.status(401).json({
            msg: "No token provided. Please sign in."
        });
    }

    try{
        const response = jwt.verify(token, jwtpass);
        next();
    } 
    catch(err){
        return res.status(401).json({
            msg: "Please sign in again!"
        });
    }
}

export { jwt_auth };
