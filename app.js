//jshint esversion:6
require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const User = require(__dirname + "/models/user.js");
const session = require('express-session')
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy; 
const FacebookStrategy = require("passport-facebook").Strategy;
const findOrCreate = require("mongoose-findorcreate");

// This is for level 3 security for generating the hash.
// const md5 = require("md5");

// This is for level 4 security for generating the hash with salt and saltrounds 10
// const bcrypt = require("bcrypt");
// const saltRounds = 10;

// console.log(md5("123456"));

// This is for encryption level-2 security.
// const encryption = require("mongoose-encryption");

// console.log(process.env.API_KEY);

const app = express();

app.use(express.static("public"));
app.set("view engine", 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    secret: 'This is little secret.',
    resave: false,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true})
.then(() => {
    console.log("Database connected successfully..");
})
.catch((err) => {
    console.log(err);
});

passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
    done(null, user);
});
  
  passport.deserializeUser(function(user, done) {
    done(null, user);
});

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    scope: [ "profile" ],
    state: true
  },
  function(accessToken, refreshToken, profile, cb) {

    console.log(profile);
    
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: "http://localhost:3000/auth/facebook/secrets"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ facebookId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

app.get("/", (req, res) => {
    res.render("home.ejs");
});

app.get("/login", (req, res) => {
    res.render("login.ejs");
});

app.get("/auth/google", passport.authenticate('google'));

app.get("/auth/google/secrets", 
  passport.authenticate('google', { failureRedirect: "/login" }),
  function(req, res) {
    res.redirect('/secrets');
});

app.get("/auth/facebook", passport.authenticate('facebook'));

app.get("/auth/facebook/secrets", 
  passport.authenticate('facebook', { failureRedirect: "/login" }),
  function(req, res) {
    res.redirect('/secrets');
});

app.get("/register", (req, res) => {
    res.render("register.ejs");
});

app.get("/secrets", (req, res) => {
    if(req.isAuthenticated()) {
        res.render("secrets.ejs");
    } else {
        res.redirect("/login");
    }
});

app.post("/register", (req, res) => {
    // commenting the code of level-5 security.

    // level-4 and level-3 security.
    // const userEmail = req.body.username;
    // bcrypt.hash(req.body.password, saltRounds, function(err, hash) {

    //     // Store hash in your password DB.
    //     const NewUser = new User({
    //         email: userEmail,
    //         password: hash
    //     });
    
    //     NewUser.save()
    //     .then(() => {
    //         console.log("User Registered successfully.");
    //         res.render("secrets.ejs");
    //     })
    //     .catch((err) => {
    //         console.log(err);
    //     });
    // });

    User.register({username: req.body.username}, req.body.password, function(err, user) {
        if (err) {
            console.log(err);
            res.redirect("/register");
        }
        else {
            passport.authenticate("local")(req, res, function() {
                console.log("User registered successfully.");
                res.redirect("/secrets");
            });
        }
        
      });
});

app.post("/login", (req, res) => {
    // commenting the code for level-5 security.

    // level-4 and level-3 security.
    // const username = req.body.username;
    // const pwd = req.body.password;

    // User.findOne({email: username})
    // .then((user) => {
    //     bcrypt.compare(pwd, user.password, function(err, result) {
    //         // result == true
    //         if(result === true) {
    //             res.render("secrets.ejs");
    //             console.log("you are on the home page!");
    //         }
    //         else{
    //             res.render("login.ejs");
    //             console.log("Incorrect password");
    //         }
    //     });
    // })
    // .catch((err) => {
    //     console.log("User not found please register.");
    //     console.log(err);
    // })

    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

    req.login(user, function(err){
        if(err) {
            console.log(err);
        }
        else {
            passport.authenticate("local")(req, res, function() {
                console.log("User logged-in successfully.");
                res.redirect("/secrets");
            });
        }
    });
});

app.get("/logout", (req, res) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
});

app.listen(3000, function() {
    console.log("Server started on port 3000");
});
