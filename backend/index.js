import express from "express";
import mongoose from "mongoose";
import { validateInput, validateInput_without_pass } from "./middlewares/signupvalidation.js";
import jwt from "jsonwebtoken";
import { Item, User } from "./db.js";
import bcrypt from "bcrypt";
import { jwt_auth } from "./middlewares/jwtauth.js";
import cors from "cors";

const app = express();
mongoose.connect("mongodb+srv://sakshamchitkara:Saksham@cluster0.fx609kp.mongodb.net/assignment1");
const jwtpass = "1234";

app.use(express.json());
app.use(cors());

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
    // console.log("hi");
    // console.log(req.body);
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
    
    // console.log("done");

});

app.use(jwt_auth);

app.get("/api/auth", function(req, res){
    res.status(200).json({
        msg: "token is correct"
    });
})

app.get("/api/profile", async function(req, res){
    const token = req.headers.authorization;
    const decoded = jwt.verify(token, jwtpass);
    const email = decoded.email;

    const user = await User.findOne({ email });

    res.json({
        first_name : user.first_name,
        last_name : user.last_name,
        email: user.email,
        contact_no : user.contact_no,
        age : user.age
    });
})

app.put("/api/profile", validateInput_without_pass, async function(req, res){
    const token = req.headers.authorization;
    const decoded = jwt.verify(token, jwtpass);
    const email = decoded.email;

    const user = await User.findOne({ email });

    try{
        const updatedData = {
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            age: req.body.age,
            contact_no: req.body.contact_no,
        };

        await User.updateOne({ email }, updatedData);

        return res.status(200).json({ 
            msg: "Profile updated successfully" 
        });
    } 
    
    catch(err){
        // console.error(err);
        return res.status(401).json({ 
            msg : "Couldn't update the profile" 
        });
    }   
})


app.get('/api/items', async function(req, res){
    try{
        const user_ki_id = req.user._id;

        const items = await Item.find({ sellerId: { $ne: user_ki_id} }).populate({
            path: 'sellerId',
            select: 'first_name last_name', 
        });

        const items_with_name = items.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            description: item.description,
            category: item.category,
            vendor: `${item.sellerId.first_name} ${item.sellerId.last_name}`,
        }));

        res.status(200).json({
            items: items_with_name
        });

    } 
    catch(err){
        console.log(err);
        res.status(401).json({ 
            msg: "Error sending items"
        });
    }
});

app.get('/api/items/:id', async function (req, res) {
    try {
        console.log("hi");
        const id = req.params.id;
        console.log(id);
        const item = await Item.findOne({ id }).populate({
            path: 'sellerId',
            select: 'first_name last_name', 
        });


        if(!item){
            return res.status(401).json({
                msg: 'Item not found' 
            });
        }

        res.status(200).json({
            id: item.id,
            name: item.name,
            price: item.price,
            description: item.description,
            category: item.category,
            vendor: `${item.sellerId.first_name} ${item.sellerId.last_name}`,
        });
    } 
    catch(err){
        console.log(err);
        res.status(401).json({
            msg: 'Error fetching item details' 
        });
    }
});

app.put('/api/sell', async function(req, res){
    try{
        const user_ki_id = req.user._id;

        const { name, price, description, category } = req.body;
        if(!name || !price || !description || !category){
            return res.status(400).json({
                msg: "All fields (name, price, description, category) are required."
            });
        }

        const new_item = new Item({
            name,
            price,
            description,
            category,
            sellerId: user_ki_id,
        });

        await new_item.save();

        res.status(200).json({
            msg: "Item successfully added for sale.",
        })
    } 
    catch(err){
        console.log(err);
        res.status(401).json({ 
            msg: "Error selling items"
        });
    }
});

app.post("/api/cart", async function (req, res){
    try {
        const user_id = req.user._id;
        const item_id = req.body.item_id;
        const item = await Item.findOne({id : item_id});

        console.log(item._id);
        // const item_mongo_id = await Item.findOne({id : item_id})._id;
        // console.log(item_mongo_id);


        const user = await User.findById(user_id).populate('cart_items');
        console.log(user);
        // console.log(user.cart_items);
        // console.log(user.cart_items.length);

        // if(user.cart_items.length == 0){
        //     // console.log("here");
        //     user.cart_items = [];
        // }

        if(!user.cart_items.some((cart_item) => cart_item._id.toString() === item._id.toString())){ //no duplicate abhi k liye to
            console.log("here2");
            user.cart_items.push(item._id);
        }
        
        await user.save();

        res.status(200).json({ 
            msg: 'Item added to cart successfully' 
        });
    } 
    catch(err){
        console.log(err);
        res.status(401).json({ 
            message: 'Error adding item to cart' 
        });
    }
});


app.listen(3000, () => {
    console.log("Server running on port 3000");
});
  
export { jwtpass };

