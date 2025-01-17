import jwt from "jsonwebtoken";
import { jwtpass } from "../index.js";
import { User } from "../db.js";

async function jwt_auth(req, res, next){
    const token = req.headers.authorization;
    // console.log(token);

    if(!token){
        return res.status(401).json({
            msg: "No token provided. Please sign in."
        });
    }

    try{
        const response = jwt.verify(token, jwtpass);
        const email = response.email;

        const user = await User.findOne({ email });

        if(!user){
            return res.status(401).json({ msg: "User not found" });
        }

        req.user = user;
        next();
    } 
    catch(err){
        return res.status(401).json({
            msg: "Please sign in again!"
        });
    }
}

export { jwt_auth };
