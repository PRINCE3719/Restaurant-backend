const express = require("express")
const app = express()
const authController = require("./controller/controller")
const db = require("./database/db")
const port = 8000;
const cors = require("cors");

app.use(express.json())
app.use(cors())




app.use("/auth",authController)



app.listen(port,()=> console.log("its running on",port));