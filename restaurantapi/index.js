const express = require("express");
const mongo = require('mongodb');
const  MongoClient = mongo.MongoClient;
const port = 4000;
const cors = require("cors");
const app = express();

app.use(cors())
app.use(express.json());
const url = 'mongodb://127.0.0.1:27017';
let db;


app.get("/locations",(reqq,resp)=>{
    db.collection("locations").find().toArray((erer,reesp)=>{
        if(erer) throw erer;
        resp.send(reesp);
    });
})

app.get("/mealtype",(req,res)=>{
    db.collection("mealTypes").find().toArray((ere,re)=>{
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
    db.collection("restaurants").find(query).toArray((erer,reesp)=>{
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

    db.collection("restaurants").find(query).sort(sort).toArray((erer,reesp)=>{
        if(erer) throw erer;
        resp.send(reesp);
    });
})


app.get("/details/:id",(reqq,resp)=>{

    let id = +reqq.params.id;
    db.collection("restaurants").find({restaurant_id:id}).toArray((erer,reesp)=>{
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
    db.collection("orders").deleteOne({orderId : oid},(ere,reslt)=>{
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
   




MongoClient.connect(url,(err , cl)=>{
    console.log("connected");
    if(err) console.log("error");
    db = cl.db("training");
    app.listen(port,()=>{
        console.log(`server 
        ${port}`);
    });
})

