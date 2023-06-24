const express = require("express");
const app = express();
const cors = require("cors");
require("./db/config");

const User = require("./db/User");
const Product = require("./db/Product");

const Jwt = require("jsonwebtoken")
const jwtKey= "e-comm"

app.use(express.json());
app.use(cors());
app.post("/register", async (req, res) => {
  let user = new User(req.body);
  let result = await user.save();
  result = result.toObject();
  delete result.password;
  Jwt.sign({result},jwtKey,{expiresIn:"2h"},(error,token)=>{
    if(error){
      res.send({ result: "Something went wrong please try after some time" });
    }
    res.send({result,auth:token});
  })
});

app.post("/login", async (req, res) => {
  if (req.body.password && req.body.email) {
    let user = await User.findOne(req.body).select("-password");
    if (user) {
      Jwt.sign({user},jwtKey,{expiresIn:"2h"},(error,token)=>{
        if(error){
          res.send({ result: "Something went wrong please try after some time" });
        }
        res.send({user,auth:token});
      })
      
    } else {
      res.send({ result: "no user found" });
    }
  } else {
    res.send({ result: "no user found" });
  }
});

app.post("/add-product", async (req, res) => {
  let product = new Product(req.body);
  let result = await product.save();
  res.send(result);
});

app.get("/products",async(req,res)=>{
  let products = await Product.find()
  if(products.length>0){
    res.send(products)
  }else{
    res.send({message:"products not found"})
  }
})



app.delete("/product/:id",async(req,res)=>{
  const result = await Product.deleteOne({_id:req.params.id})
  res.send(result)
})

app.get("/product/:id",async(req,res)=>{
  const result = await Product.findOne({_id:req.params.id})
  if(result){
    res.send(result)
  }else{
    res.send({message:"record not found"})
  }
})

app.put("/product/:id",async(req,res)=>{
  let result = await Product.updateOne(
    {_id:req.params.id},
    {
      $set:req.body
    }
  )
  res.send(result)
})

app.get("/search/:key",verifyToken,async(req,res)=>{
  let result = await Product.find({
    "$or":[
       {name:{$regex:req.params.key}},
       {company:{$regex:req.params.key}},
       {category:{$regex:req.params.key}},
    ]
  })
  res.send(result)
})

function verifyToken(req,res,next){
console.log("middleware called")
next()
}

app.listen(7000);
