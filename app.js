//jshint esversion:6
require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const User = require(__dirname + "/models/user.js");
const md5 = require("md5");

// console.log(md5("123456"));

// This is for encryption level-2 security.
// const encryption = require("mongoose-encryption");

// console.log(process.env.API_KEY);

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true})
.then(() => {
    console.log("Database connected successfully..");
})
.catch((err) => {
    console.log(err);
});

app.get("/", (req, res) => {
    res.render("home.ejs");
});

app.get("/login", (req, res) => {
    res.render("login.ejs");
});

app.get("/register", (req, res) => {
    res.render("register.ejs");
});

app.post("/register", (req, res) => {
    const userEmail = req.body.username;
    const passwd = md5(req.body.password);

    const NewUser = new User({
        email: userEmail,
        password: passwd
    });

    NewUser.save()
    .then(() => {
        console.log("User Registered successfully.");
        res.render("secrets.ejs");
    })
    .catch((err) => {
        console.log(err);
    });
});

app.post("/login", (req, res) => {
    const username = req.body.username;
    const pwd = md5(req.body.password);

    User.findOne({email: username})
    .then((user) => {
        if(user.password === pwd) {
            res.render("secrets.ejs");
            console.log("you are on the home page!");
        }
        else{
            res.render("login.ejs");
            console.log("Incorrect password");
        }
    })
    .catch((err) => {
        console.log("User not found please register.");
        console.log(err);
    })
});

app.listen(3000, function() {
    console.log("Server started on port 3000");
});
