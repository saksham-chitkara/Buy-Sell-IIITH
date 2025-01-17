import mongoose from 'mongoose';
import AutoIncrementFactory from 'mongoose-sequence';

const AutoIncrement = AutoIncrementFactory(mongoose.connection);

//User Schema
const user = new mongoose.Schema({
    first_name: {
        type: String,
        required: true,
        trim: true
    },

    last_name: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    age: {
        type: Number,
        required: true,
    },

    contact_no: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true,
    },

    cart_items: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item' 
    }],

    // abhi k liye isme sirf text h kuch aur dalna ho to dkhio
    //**
    // 
    // 
    // 
    // 
    // 
    // 
    //  */
    seller_reviews: [{   
        type: String,
        required: true
    }]
});



// Item Schema
const item = new mongoose.Schema({
    id : {
        type: Number,
        unique: true
    },

    name: {
        type: String,
        required: true,
        trim: true
    },

    price: {
        type: Number,
        required: true,
        min: 0
    },

    description: {
        type: String,
        required: true,
        trim: true
    },

    category: {
        type: String,
        required: true,
        enum: ['clothing', 'grocery', 'academics', 'sports', 'others'] 
    },

    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

item.plugin(AutoIncrement, { inc_field: 'id' }); // Auto-increments the `id` field

//Order Schema
const order = new mongoose.Schema({
    transactionId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    buyerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: true
    },

    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    amount: {
        type: Number,
        required: true,
        min: 0
    },

    hashedOtp: {
        type: String,
        required: true,
    }
});

const User = mongoose.model('User', user);
const Item = mongoose.model('Item', item);
const Order = mongoose.model('Order', order);

export {User, Item, Order};


// input validation zod se krra to yaha correct data hi ayga so no checking by mongo
// abhi k liye yahi h baad mein edit krlio category of item dalni ho to
// abhi orders mein transactionID di h vo dkhio normal ID h ya kuch aur agar normal h to htadio kyuki mongo apne aap de deta
