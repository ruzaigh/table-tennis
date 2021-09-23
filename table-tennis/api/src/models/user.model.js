const mongoose = require('mongoose');
const _ = require('lodash');
const jwt = require('jsonwebtoken')
const crypto = require('crypto');
const { promises } = require('fs');
const { resolve } = require('path');
//JWT Secret
const jwtSecret = "14821714584227043538sdgsdgsdgewtewfsdsdf0517320350";
const UserSchema = new mongoose.UserSchema({
    email:{
        type: String,
        required: true,
        minLength: 1,
        trim: true,
        unique: true,
    },
    password:{
        type: String,
        required: true,
        minLength: 8,
    },
    sessions: [{
        token:{
            type: String,
            required: true,
        },
        expiresAt: {
            type: Number,
            required: true
        }
    }]
});
//Instance method
UserSchema.methods.toJSON = function(){
    const user = this;
    const userObject = user.toObject()
    //return the document expect the password and sessions (these shouldnt be made available)
    return _.omint(userObject, ['password', 'sessions']);
}
UserSchema.methods.generateAccessAuthToken = function(){
    const user = this;
    return new Promise((resolve,reject) =>{
        ///Create the JSON Web Token an return that 
        jwt.sign({ _id: user_id.toHexString()},jwtSecret, { expiresIn: "15m"}, (err,token) =>{
            if(!err){
                resolve(token)
            }else{
                //there is an error
                reject();
            }
        })
    })
}
UserSchema.methods.generateRefreshAuthToken = function(){
    //this method simply generates a 64byte hex string - it doesnt scave it to the database. saveSessionDatabase() does that
    return new Promise((resolve, reject) =>{
        crypto.randomBytes(64,(err,buf) =>{
            if(!err){
                //no error
                let token = buf.toString('hex');
                return resolve(token);
            }
        })
    })
}
let saveSessionToDatabase = (user, refreshToken) =>{
    //save session to database
    return new Promise((resolve, reject) =>{
        let expiresAt = generateRefreshTokenExpiryTime();

        user.sessions.push({ 'token': refreshToken, expiresAt});
    })
}
let generateRefreshTokenExpiryTime = () =>{
    let daysUntilExpire = "10";
    let secondsUntilExpire = ((daysUntilExpire * 24) * 60) * 60;
    return((Date.now() / 1000) + secondsUntilExpire);
}