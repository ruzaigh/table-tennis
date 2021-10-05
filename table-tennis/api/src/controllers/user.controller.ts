import { Request, Response } from "express";
import { successResponse, failureResponse } from "../modules/service";
import * as bcrypt from "bcrypt";
import DbClient from "../services/db-client";
import { Db, ObjectID } from "mongodb";
import { generateAccessToken } from "../auth/auth-helper";
import moment = require("moment");

export const createUser = async (req: Request, res: Response) => {

    //store the user 
    let newUser: INewUser = req.body;
    let user: IUser = {
        username: newUser.username.replace(/([^a-zA-Z0-9._#$!~-])/g, ""),
        email: newUser.email.toLowerCase(),
        passwordHash: "",
        name: newUser.name.replace(/([^a-zA-Z0-9._#$!~-])/g, ""),
    }
    //secure their password
    if (newUser.password) {
        const salt = bcrypt.genSaltSync(10);
        user.passwordHash = bcrypt.hashSync(newUser.password, salt); //has password
        delete newUser.password
    } else failureResponse("Incorrect body", {}, res);


    //Check db for existance
    let foundUser = await DbClient.db.collection("user").findOne({
        $or: [
            { email: { $regex: new RegExp(`^${user.email}$`, "i") } },
            { username: { $regex: new RegExp(`^${user.username}$`, "i") } },
        ]
    }); // find them by email
    if (foundUser) return failureResponse("User already exists", {}, res);

    //new user, so lets add the user to the DB

    DbClient.db
        .collection("user")
        .insertOne(user)
        .then(async (insertRes) => {
            //respond
            user.passwordHash = "";
            //define expiry time for email validation link
            let verificationExpiryTime = moment(new Date()).add(7, "days").toDate();
            //insert verification code to collection
            let randomCode = Math.floor(Math.random() * 90000) + 10000;
            let verificationData = {
                userId: user._id,
                code: randomCode,
                expiresIn: verificationExpiryTime,
                type: 'Email Verification',
                status: "NOT USED",
            };
            await DbClient.db
                .collection("verificationCodes")
                .insertOne(verificationData).then(() => {
                    successResponse('User inserted successfully', { user, token: generateAccessToken(user) }, res);
                })
        })
        .catch((insertErr) => {
            console.log(insertErr)
            return failureResponse("User already exists", {}, res);
        });
};
//ch eck if the email already exists on the system
export const checkEmailExist = async (req: Request, res: Response) => {
    try {
        let email = req.body.email;
        console.log({ email });
        let foundUser = await DbClient.db.collection("user").findOne({ email });
        if (foundUser) {
            return successResponse('User already exist', { exists: true }, res);
        } else {
            return successResponse("User does not exist", { exists: false }, res);
        }
    } catch (err) {
        console.log(err);
        failureResponse("Error", {}, res);
    }
}
/**
 * Checks if users email has been verified
 * @param req must contain: nothing, get request
 * @param res response object
 * 
 * CyberSec Risk rating: Min
 */
export const isEmailVerified = async (req: Request, res: Response) => {
    try {
        DbClient.db
            .collection("user")
            .findOne({ _id: new ObjectID(req['userId']) })
            .then(
                (result: any) => {
                    successResponse(
                        "Email verification result",
                        { emailVerified: result.emailVerified },
                        res
                    );
                },
                (err) => {
                    console.log(err);
                    failureResponse("Email verification failed", {}, res);
                }
            );
    } catch (error) {
        console.log(error);
        failureResponse("FAIL", {}, res);
    }
};
/**
 * set status for EMAIL validation (not like a pro verified user)
 * @param req must contain: id of user to verify, their unique OTP
 * @param res response object
 * 
 * CyberSec Risk rating: Low
 * Not authed because this gets called by an email click
 */
export const updateUserVerificationStatus = async (
    req: Request,
    res: Response
) => {
    // Check to see if the user has a verification code in the db first
    try {
        DbClient.db
            .collection("verificationCodes")
            .findOne({ userId: new ObjectID(req.params.id) })
            .then(async (result: any) => {
                if (new Date(result.expiresIn) < new Date()) {
                    // @todo implement expiry stuff
                }
                if (result.code.toString() === req.body.code) {
                    //Mark the email verified
                    await DbClient.db.collection("user").updateOne(
                        { _id: new ObjectID(req.params.id) },
                        {
                            $set: { emailVerified: true },
                        }
                    );
                    successResponse("Worked", { emailVerified: true }, res);
                } else {
                    failureResponse(
                        "Failed to verifiy email",
                        { emailVerified: false },
                        res
                    );
                }
            });
    } catch (err) {
        console.log(err);
        failureResponse("Failed to verifiy email", { emailVerified: false }, res);
    }
};
/**
 * Log a user in and return their full profile
 * @param req must contain: email and password
 * @param res response object
 * 
 * CyberSec Risk rating: low
 */
export const login = (req: Request, res: Response) => {
    let LogingDetails: ILogin = req.body;
    DbClient.db
        .collection("user")
        .findOne({ email: { $regex: LogingDetails.email, $options: "i" } })
        .then(async (dbres) => {
            //check id password hash's match
            if (dbres && bcrypt.compareSync(LogingDetails.password, dbres.passwordHash)) {
                //Generate a jwt
                delete dbres.passwordHash;
                let jwt = generateAccessToken(dbres);
                successResponse("SUCCESS", { jwt, user: dbres }, res);
            } else {
                successResponse("User not found ", {}, res);
            }
        });
}


export interface INewUser {
    username: string;
    name: string,
    email: string;
    password: string;
}
export interface IUser {

    _id?: any;
    email: string;
    name: string,
    passwordHash?: string;
    username: string
}
export interface ILogin {
    email: string;
    password: string;
}