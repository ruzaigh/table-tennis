const mongoose = require('mongoose');
const _ = require('lodash');
const jwt = require('jsonwebtoken')
const crypto = require('crypto');
const bcrypt = require('bcryptjs')
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
UserSchema.methods.createSession = function(){
    let user = this;

    return user.generateRefreshAuthToken().then((refreshToken) =>{
        return saveSessionToDatabase(user, refreshToken)
    }).then((refreshToken) =>{
        //saved to databasse successfully
        //now return the refresh token
        return refreshToken;
    }).catch((err) =>{
        return Promise.reject('Failed to save session to database.\n' + err);
    })
}

/**Modal Mehtods (static methods) */
UserSchema.statics.findByIdAndToken = function(_id, token){
    //finds user by id and token
    //used in auth middleware (verifySession)
    const User = this;

    return User.findOne({
        _id,
        'sessions.token': token
    });
}
UserSchema.statics.findByCredentials = function(email, password){
    let User = this;
    return User.findOne({ email}).then((User) =>{
        if(!User)return Promise.reject();

        return new Promise((resolve, resject) =>{
            bcrypt.compare(password, user.password, (err, res)=>{
                if(res)resolve(user);
                else{
                    reject();
                }
            })
        })
    })
}

UserSchema.statics.hasRefreshTokenExpired = ( expiresAt ) =>{
    let secondsSinceEpoch = Date.now() / 1000;
    if (expiresAt > secondsSinceEpoch){
        ///hasnt expired
        return false
    }else{
        //has expired
        return true
    }
}

/**MiddleWare */
//Before a userdocument is saved, this code tuns 
UserSchema.pre('save', function(next){
    let User = this;
    let cosrFactor = 10;

    if(User.isModified('password')){
        //if the password field has been edited/changed then run this code

        //Generate salt and hash password
        bcrypt.genSalt(cosrFactor,(err, salt) =>{
            bcrypt.hash(User.password, salt, (err, hash)=> {
                user.password = hash;
                next();
            })
        })
    }else{
        next();
    }
});

/** Helper methods  */
let saveSessionToDatabase = (user, refreshToken) =>{
    //save session to database
    return new Promise((resolve, reject) =>{
        let expiresAt = generateRefreshTokenExpiryTime();

        user.sessions.push({ 'token': refreshToken, expiresAt});

        user.save().then(() =>{
            //saved session  successfully
            return resolve(refreshToken);
        }).catch((err) =>{
            reject(err);
        });
    })
}
let generateRefreshTokenExpiryTime = () =>{
    let daysUntilExpire = "10";
    let secondsUntilExpire = ((daysUntilExpire * 24) * 60) * 60;
    return((Date.now() / 1000) + secondsUntilExpire);
}

const User = mongoose.model('User', UserSchema);

module.exports = { User}