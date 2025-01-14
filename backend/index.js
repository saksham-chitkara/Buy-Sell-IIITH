import express from "express";
import mongoose from "mongoose";
import { validateInput } from "./middlewares/signupvalidation.js";
import jwt from "jsonwebtoken";
import { User } from "./db.js";
import bcrypt from "bcrypt";
import { jwt_auth } from "./middlewares/jwtauth.js";

const app = express();
mongoose.connect("mongodb+srv://sakshamchitkara:Saksham@cluster0.fx609kp.mongodb.net/assignment1");
const jwtpass = "1234";

app.use(express.json());

app.post("/api/signup", validateInput, async function(req, res){
    const { first_name, last_name, email, age, contact_no, password } = req.body;

    const old_user = await User.findOne({ email });
    if(old_user){
        return res.status(401).json({
            msg: "Email is already registered!"
        });
    }

    const hashed_pass = await bcrypt.hash(password, 10);

    const newUser = new User({
        first_name,
        last_name,
        email,
        age,
        contact_no,
        password: hashed_pass,
    });

    await newUser.save();

    const token = jwt.sign({email : req.body.email}, jwtpass);

    res.status(200).json({
        msg : "Successfully signed up!",
        token
    })
});


app.post("/api/login", async function(req, res){
    const email = req.body.email;
    const password = req.body.password;

    const user = await User.findOne({ email });
    if(!user){
        return res.status(401).json({
            msg: "User not found!" 
        });
    }

    const comp = await bcrypt.compare(password, user.password);
    if(!comp){
        return res.status(401).json({
            msg: "Invalid password!" 
        });
    }

    const token = jwt.sign({ email: user.email }, jwtpass);

    res.json({
        msg: "Successfully logged in!",
        token,
    }); 
});

app.use(jwt_auth);

app.listen(3000, () => {
    console.log("Server running on port 3000");
});
  
export { jwtpass };

