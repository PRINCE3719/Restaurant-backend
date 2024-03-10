const express = require("express");
const mongo = require('mongodb');
const  MongoClient = mongo.MongoClient;
const port = 4000;
const cors = require("cors");
const dotenv = require("dotenv");
const app = express();
dotenv.config();


app.use(cors())
app.use(express.json());
const url = process.env.MONGO_URI;




   





MongoClient.connect(url, (err, cl) => {
    if (err) {
        console.log("Error connecting to MongoDB:", err);
        return;
    }
    console.log("Connected to MongoDB");

    const db = cl.db("restaurant");

   
    app.get("/locations",(reqq,resp)=>{
        db.collection("locations").find().toArray((erer,reesp)=>{
            if(erer) throw erer;
            resp.send(reesp);
        });
    })
    
    app.get("/mealtype",(req,res)=>{
        db.collection("mealtypes").find().toArray((ere,re)=>{
            if(ere) throw ere;
            res.send(re);
        });
    })
    
    app.get("/restaurants",(reqq,resp)=>{
        let query = {};
        let stateid = +reqq.query.state_id;
        let mealId = +reqq.query.mealId;
    
        if(stateid){
            query = {state_id : stateid }
        }
        else if(mealId){
            query = {"mealTypes.mealtype_id" : mealId}
        }
        db.collection("restaurant").find(query).toArray((erer,reesp)=>{
            if(erer) throw erer;
            resp.send(reesp);
        });
    })
    
    
    app.get("/filter/:mealId",(reqq,resp)=>{
        let query = {};
        let mealId = +reqq.params.mealId;
        let cuisineId = +reqq.query.cuisineId; 
        let lcost = +reqq.query.lcost;
        let hcost = +reqq.query.hcost;
        let sort = {cost:1}//asc
       
    
        if(reqq.query.sort){
            sort = {cost : reqq.query.sort};
        }
    
    
        if(cuisineId){
            query = { "mealTypes.mealtype_id" : mealId ,
            "cuisines.cuisine_id" :cuisineId }
        }
        else if(lcost & hcost){
            query = { "mealTypes.mealtype_id" : mealId,
        $and :[{cost:{$gt : lcost,$lt : hcost}}]}
        }
    
        db.collection("restaurant").find(query).sort(sort).toArray((erer,reesp)=>{
            if(erer) throw erer;
            resp.send(reesp);
        });
    })
    
    
    app.get("/details/:id",(reqq,resp)=>{
    
        let id = +reqq.params.id;
        db.collection("restaurant").find({restaurant_id:id}).toArray((erer,reesp)=>{
            if(erer) throw erer;
            resp.send(reesp);
        });
    })
    
         
    app.get("/menu/:id",(reqq,resp)=>{
        let id = +reqq.params.id;
        db.collection("menu").find({restaurant_id:id}).toArray((erer,reesp)=>{
            if(erer) throw erer;
            resp.send(reesp);
        });
    })
     
    app.post("/menuItem",express.json(),(reqq,resp)=>{
        if(Array.isArray(reqq.body)){
            db.collection("menu").find({menu_id: {$in : reqq.body} }).toArray((erer,reesp)=>{
                if(erer) throw erer;
                resp.send(reesp);
            });
        }
        else{
            resp.send("invalid men id");
        }
        
    })
    
    app.post("/placeorder",(req,res)=>{
        console.log(req.body);
        db.collection("orders").insertOne(req.body,(er,result)=>{
            if(er) throw er;
            res.send("order placed");
        })
    })
    
    app.get("/order",(req,resp)=>{
        let query= {}
        let email = req.query.email;
        if(email){
            query = {email}
        }
        db.collection("orders").find(query).toArray((erer,reslt)=>{
        if(erer) throw erer;
        resp.send(reslt);
        })
    })
         
    
    app.delete("/deleteOrder/:id",(req,resp)=>{
        let oid = +req.params.id;
        db.collection("orders").deleteOne({id : oid},(ere,reslt)=>{
            if(ere) throw ere;
            resp.send("deleted sccesfl");
        })
        }
    )
    
    app.put("/updateOrder/:id",(req,res)=>{
        let oid = +req.params.id;
        db.collection("orders").updateOne({orderId : oid},{$set:{
            status:req.body.status,
            bank_name:req.body.bank_name,
            date:req.body.date
        }
    },(ere,reslt)=>{
            if(ere) throw ere;
            res.send("updates successfully");
        })
    })
    // Define other routes here...

    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
});





// const uri = "mongodb+srv://princeprakash:PUiUZHn0ufoOq47D@cluster1.k0v406s.mongodb.net/";




// async function connectToAtlas() {
//   const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true ,
//     tls: true,
//     tlsProtocol: 'TLSv1.2'});

//   try {
//     await client.connect();
//     console.log("Connected to MongoDB Atlas");

//     // Once connected, you can perform database operations here
    
//     // Example: List all databases

//   } catch (err) {
//     console.error("Error connecting to MongoDB Atlas", err);
//   } finally {
//     // Close the connection when done
//     await client.close();
//     console.log("Connection to MongoDB Atlas closed");
//   }
// }

// connectToAtlas();
