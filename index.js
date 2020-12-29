const express = require('express')
const mongodb = require('mongodb')
const cors = require('cors')
const bcrypt = require('bcrypt')
const nodemailer = require("nodemailer")
require("dotenv").config();
const jwt = require("jsonwebtoken");
const auth=require('./jwt/authorization');

const mongoClient = mongodb.MongoClient;
const objectId = mongodb.ObjectID;

const app = express();
const dbURL = process.env.DB_URL || "mongodb:127.0.0.1:27017"
const port = process.env.PORT || 3000;
app.use(express.json());
app.use(cors());


// app.post("/register-1", async (req, res) => {
//   try {
//     let clientInfo = await mongoClient.connect(dbURL);
//     let db = clientInfo.db("UserData");
//     let result = await db
//       .collection("users")
//       .findOne({ email: req.body.email });
//     if (result) {
//       res.status(400).json({ message: "User already registered" });
//       clientInfo.close();
//     } else {
//       let salt = await bcrypt.genSalt(15);
//       let hash = await bcrypt.hash(req.body.password, salt);
//       req.body.password = hash;
//       await db.collection("users").insertOne(req.body);
//       res.status(200).json({ message: "User registered" });
//       clientInfo.close();
//     }
//   } catch (error) {
//     console.log(error);
//   }
// });

//get all users data

app.get("/", async (req, res) => {
    try {
      let clientInfo = await mongoClient.connect(dbURL);
      let db = clientInfo.db("UserData");
      let data = await db.collection("users").find().toArray();
      res.status(200).json({ data });
      clientInfo.close();
    } catch (error) {
      console.log(error);
      res.send(500);
    }
  });

// verify user by sending mail
  app.post("/verify-user", async (req, res) => {
    try {
      let clientInfo = await mongoClient.connect(dbURL);
      let db = clientInfo.db("UserData");
      let result = await db
        .collection("users")
        .findOne({ email: req.body.email });
      if (result) {
        res.status(400).json({ message: "User already registered" });
        clientInfo.close();
      } else {
            var string = Math.random().toString(36).substr(2,10)
            let transporter = nodemailer.createTransport({
                host: "smtp.gmail.com",
                port: 587,
                secure: false,
                auth: {
                  user: process.env.SENDER, // generated ethereal user
                  pass: process.env.PASS, // generated ethereal password
                },
            });
                let info = await transporter.sendMail({
                    from: process.env.SENDER, 
                    to:  req.body.email, 
                    subject: "Registration", 
                    text: "Pizza delivery Registration", 
                    html: `<p>Here is the link to register</p><br><a href="http://localhost:3000/register.html/${req.body.email}">Click here</a>`, 
                  });
                    
                    await db.collection("users").insertOne(req.body);
                    res.status(200).json({ message: "Verification mail sent" });
                    clientInfo.close();
      }
    } catch (error) {
      console.log(error);
    }
  });
  
// user login

  app.post("/login", async (req, res) => {
    try {
      let clientInfo = await mongoClient.connect(dbURL);
      let db = clientInfo.db("UserData");
      console.log(req,'req')
      console.log("test")
      let result = await db
        .collection("users")
        .findOne({ email: req.body.email });
      if (result) {
        let isTrue = await bcrypt.compare(req.body.password, result.password);
        if (isTrue) {
          res.status(200).json({ message: "Login" });
        } else {
          res.status(200).json({ message: "Check Email/Password" });
        }
      } else {
        res.status(400).json({ message: "User not registered" });
      }clientInfo.close()
    } catch (error) {
      res.json(error);
    }
  });



  // app.post("/login-1", async (req, res) => {
  //   try {
  //     let clientInfo = await mongoClient.connect(dbURL);
  //     let db = clientInfo.db("UserData");
  //     let result = await db
  //       .collection("users")
  //       .findOne({ email: req.body.email });
  //     if (result) {
  //       let isTrue = await bcrypt.compare(req.body.password, result.password);
  //       let status=result.status;
  //       if (isTrue) {
  //         if(status==true){
  //           let token=await jwt.sign({userId:result._id,userName:result.name},process.env.PASS,{expiresIn:'1h'});
                 
  //             res.status(200).json({message:"success",id:result._id,token});
  //         }else{
  //           res.status(200).json({message:"Please Click on conformation link send to mail to activate your account"})
  //         }
         
  //       } else {
  //         res.status(200).json({ message: "Login unsuccessful" });
  //       }
  //     } else {
  //       res.status(400).json({ message: "User not registered" });
  //     }
  
  //     clientInfo.close();
  //   } catch (error) {
  //     console.log(error);
  //   }
  // });


//forgot password

  app.post('/forgot-password',async(req,res)=>{

    try {
        let clientInfo = await mongoClient.connect(dbURL)
        let db =  clientInfo.db("UserData")
        let result = await db.collection("users").findOne({email:req.body.email})
        if (result) {
            //var string = Math.random().toString(36).substr(2,10)
            let transporter = nodemailer.createTransport({
                host: "smtp.gmail.com",
                port: 587,
                secure: false,
                auth: {
                  user: process.env.SENDER, // generated ethereal user
                  pass: process.env.PASS, // generated ethereal password
                },
            });
                let info = await transporter.sendMail({
                    from: process.env.SENDER, 
                    to:  req.body.email, 
                    subject: "Reset Password ", 
                    text: "Reset password", 
                    html: `<p>Here is the link to reset your password</p><br><a href="http://localhost:5000/auth/${req.body.email}">Click here</a>`, 
                  });
            res.status(200).json({message:"user exists"})
            clientInfo.close()
        } else {
            res.status(400).json({message:"user doesn't exist"})
            
        }clientInfo.close()
        
    } catch (error) {
        console.log(error)
    }
})

// register user and set password
app.post("/register", async (req, res) => {
    try {
      let clientInfo = await mongoClient.connect(dbURL);
      let db = clientInfo.db("UserData");
      let result = await db
        .collection("users")
        let salt = await bcrypt.genSalt(15);
        let hash = await bcrypt.hash(req.body.password, salt);
        req.body.password = hash;
        await db.collection("users").insertOne(req.body);
        res.status(200).json({ message: "User registered" });
        clientInfo.close();
      
    } catch (error) {
      console.log(error);
    }
  });

// admin-login

  app.post("/admin-login", async (req, res) => {
    try {
      let clientInfo = await mongoClient.connect(dbURL);
      let db = clientInfo.db("UserData");
      let result = await db
        .collection("Admin")
        .findOne({ email: req.body.email });
      if (result) {
        if (req.body.password===result.password) {
          res.status(200).json({ message: "Login success" });
        } else {
          res.status(200).json({ message: "Check Email or Password admin" });
        }
      } else {
        res.status(400).json({ message: "admin not registered" });
      }
      clientInfo.close()
    } catch (error) {
      console.log(error);
    }
  });


//get add on pizza base

  app.get("/pizzaBase", async (req, res) => {
    try {
      let clientInfo = await mongoClient.connect(dbURL);
      let db = clientInfo.db("UserData");
      let data = await db.collection("pizzaBase").find().toArray();
      res.status(200).json({ data });
      clientInfo.close();
    } catch (error) {
      console.log(error);
      res.send(500);
    }
  });
// get ad on sauce
  app.get("/sauce", async (req, res) => {
    try {
      let clientInfo = await mongoClient.connect(dbURL);
      let db = clientInfo.db("UserData");
      let data = await db.collection("sauce").find().toArray();
      res.status(200).json({ data });
      clientInfo.close();
    } catch (error) {
      console.log(error);
      res.send(500);
    }
  });
//get add-on cheese data
  app.get("/cheeseData", async (req, res) => {
    try {
      let clientInfo = await mongoClient.connect(dbURL);
      let db = clientInfo.db("UserData");
      let data = await db.collection("cheeseData").find().toArray();
      res.status(200).json({ data });
      clientInfo.close();
    } catch (error) {
      console.log(error);
      res.send(500);
    }
  });
//get add-on veggies
  app.get("/veggies", async (req, res) => {
    try {
      let clientInfo = await mongoClient.connect(dbURL);
      let db = clientInfo.db("UserData");
      let data = await db.collection("veggies").find().toArray();
      res.status(200).json({ data });
      clientInfo.close();
    } catch (error) {
      console.log(error);
      res.send(500);
    }
  });

  app.get("/pizzas", async (req,res) =>{
    try {
        let clientInfo = await mongoClient.connect(dbURL)
        let db = clientInfo.db("UserData")
        let data = await db.collection("pizzaName").find().toArray()
        res.status(200).json({ data });
        clientInfo.close();
    } catch (error) {
        console.log(error)
        res.send(500)
    }
})

app.get("/get-orders", async (req,res) =>{
    try {
        let clientInfo = await mongoClient.connect(dbURL)
        let db = clientInfo.db("UserData")
        let result = await db.collection("orders").find().toArray()
        res.status(200)
    } catch (error) {
        console.log(error)
        res.send(500)
    }
})

app.put("/edit-orders", async (req,res) =>{
    try {
        let clientInfo = await mongoClient.connect(dbURL)
        let db = clientInfo.db("UserData")
        let result = await db.collection("orders").findOne({id:req.body.id})
        res.status(200)
    } catch (error) {
        console.log(error)
        res.send(500)
    }
})


//after building Ui pending
app.post("/update-orders", async (req,res) =>{
    try {
        let clientInfo = await mongoClient.connect(dbURL)
        let db = clientInfo.db("UserData")
        let result = await db.collection("orders").findOne({id:req.body.id})
        if(result){
            res.status(200).json({ message: "Order Created" })
        }
        res.status(200)
    } catch (error) {
        console.log(error)
        res.send(500)
    }
})


app.listen(port, ()=>{console.log("your port runs with", port)})