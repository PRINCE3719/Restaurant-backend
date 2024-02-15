const express = require("express")
const router = express.Router();
const bcrypt = require("bcryptjs")
const app = express()
const username = require("../models/model")
const jwt = require("jsonwebtoken")
const key = require("../config")


module.exports = router;




router.post("/register", (req, res) => {

    const password = req.body.password;
    if (!password || typeof password !== 'string') {
        return res.status(400).send("Invalid password");
    }

    const hashPassword = bcrypt.hashSync(password, 8)
    console.log("yesss", hashPassword);
    username.create({
        name: req.body.name,
        email: req.body.email,
        password: hashPassword,
        phone: req.body.phone,
        role: req.body.role

    }, (err, data) => {
        if (err)
            return res.send("error while registering", err.message)
        res.send("registration success");
    })
})

router.post("/login", (req, res) => {
    username.findOne({ email: req.body.email }, (err, user) => {
        console.log(user);
        if (err) return res.send({ auth: false, token: "error while logging" })
        if (!user) return res.send({ auth: false, token: "invalid user" })
        else {
            const pass = bcrypt.compareSync(req.body.password, user.password)
            console.log(pass);
            if (!pass) return res.send({ auth: false, token: "invalid credential" })
            let tok = jwt.sign({ id: user._id }, key.secret, {
                expiresIn: 172800
            })
            res.send({ auth: true, token: tok })
        }
    })
})

router.get("/users", (req, res) => {
    username.find({}, (err, data) => {
        if (err) throw err;
        res.send(data);

    })
})

router.get("/userInfo",(req,res)=>{
   let to = req.headers["x-acess-token"];
   console.log(to);
   if(!to) 
   res.send({auth:false,token:"no token"})
    jwt.verify(to, key.secret,(err,data)=>{
        console.log(data);
        if(err) res.send({auth:false,token:"false"})
        username.findById(data.id,(err,resu)=>{
            res.send(resu);
    })
    })
})