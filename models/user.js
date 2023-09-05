require('dotenv').config()
const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const findOrCreate = require("mongoose-findorcreate");

// const encrypt = require("mongoose-encryption");

const userSchema = new mongoose.Schema({
    email: String, 
    password: String,
    googleId: String,
    facebookId: String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

// This is for password encryption level-2.
// userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ['password']} );

module.exports = new mongoose.model("User", userSchema);

// During save, documents are encrypted and then signed. 
// During find, documents are authenticated and then decrypted