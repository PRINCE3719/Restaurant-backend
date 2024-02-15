const express = require("express");
const app = express()
const cors = require("cors");
const port = 7000;
const dotenv = require("dotenv");
const mongoose  = require("mongoose");
const crypto = require("crypto");
const razorpay = require("razorpay");
dotenv.config();

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({extended:true}));

mongoose.connect(process.env.MONGODB).then(()=>{
    console.log("connection set");
})
.catch((error)=>{
    console.log(error);
})

const instance = new razorpay({
    key_id:process.env.Key,
    key_secret:process.env.secret,
})


const paymentSchema = new mongoose.Schema({
    razorpay_order_id : {
        type:String,
        required:true,
    },
    razorpay_payment_id : {
        type:String,
        required:true,
    },
    razorpay_signature : {
        type:String,
        required:true,
    },
  
})


const Payment = mongoose.model("Payment",paymentSchema)




app.post("/checkout",(req,res)=>{

    const options = {
        amount:Number(req.body.amount*100),
        currency:"INR",
    };
    const order = instance.orders.create(options);
    console.log(order);
    res.status(200).json({
        success:true,order
    })
})

app.post("/payment-verify",(req,res)=>{
    const {razorpay_order_id,razorpay_payment_id,razorpay_signature} = req.body;
    const body = razorpay_order_id + "|" +razorpay_payment_id;
    const expectedsignature = crypto.createHmac('pri009',process.env.secret).update(body.toString()).digest('hex');
    const isauth = expectedsignature === razorpay_signature;
    if(isauth){
        Payment.create({
            razorpay_order_id,razorpay_payment_id,razorpay_signature
        });
        res.redirect(`http://localhost:3000/success?reference=${razorpay_payment_id}`)
    }
    else{
        res.status(400).json({success:false}); 
    }

})


app.get("/api/getkey",(req,res)=>{
    return res.status(200).json({key:process.env.Key})
})

app.listen(port,()=>{
    console.log("server start");
})


