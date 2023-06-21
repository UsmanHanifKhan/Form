require("dotenv").config();
const express = require("express");
const app = express();
const port = 3000;

require("./db/conn");
const Register = require("./models/register");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieparser = require("cookie-parser");
const Auth = require("./Auth/auth");

console.log(`SECRET_KEY is ${process.env.SECRET_KEY}`);
app.use(cookieparser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "hbs");

app.get("/", (req, res) => {
  res.render("index");
});
app.get("/logIn", (req, res) => {
  res.render("logIn");
});
app.get("/secret", Auth, (req, res) => {
  // console.log(`this cookies request :${req.cookies.jwt}`)
  res.render("secret");
});
app.get("/logout", Auth, async (req, res) => {
  try {
    // console.log(`this cookies request :${req.cookies.jwt}`)
    console.log(req.user)
    // for single user logout
    // req.user.tokens = req.user.tokens.filter((currElement)=>{
    //   return currElement.token!== req.token
    // })
     
    req.user.tokens = []

    res.clearCookie("jwt");
    await req.user.save()
    res.render("logIn"); 
  } catch (error) {
    res.status(500).send(error);
  }
});
app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", async (req, res) => {
  try {
    password = req.body.password;
    cPassword = req.body.confirmpassword;
    if (password === cPassword) {
      const empolyeeRegister = new Register({
        name: req.body.name,
        phone: req.body.phone,
        email: req.body.email,
        password: password,
        confirmpassword: cPassword,
      });

      const token = await empolyeeRegister.generateAuthToken();
      console.log(token);

      res.cookie("jwt", token, {
        expires: new Date(Date.now() + 6000000),
        httpOnly: true,
        secure: true,
      });

      const Registered = await empolyeeRegister.save();
      res.status(201).render("logIn");
    } else {
      res.send("passwords do not match");
    }
  } catch (error) {
    res.status(404).send(error);
  }
});

app.post("/logIn", async (req, res) => {
  try {
    email = req.body.email;
    password = req.body.password;
    const userEmail = await Register.findOne({ email: email });
    const isMatch = await bcrypt.compare(password, userEmail.password);

    const token = await userEmail.generateAuthToken();
    console.log(`this token is ${token}`);

    res.cookie("jwt", token, {
      expires: new Date(Date.now() + 60000000),
      httpOnly: true,
    });
    if (isMatch) {
      res.status(201).render("index");
      console.log(isMatch);
    } else {
      res.send("invalid Details");
    }
  } catch (error) {
    res.status(404).send(error);
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost: ${port}`);
});
