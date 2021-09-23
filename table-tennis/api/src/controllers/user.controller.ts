import { Request, Response } from "express";
import { successResponse, failureResponse } from "../modules/common/service";
import * as bcrypt from "bcrypt";
import DbClient from "../services/db-client";
import { ObjectID } from "mongodb";
import { generateAccessToken } from "../auth/auth-helper";
import moment = require("moment");

export const createUser = async (req: Request, res: Response) =>{

    //store the user 
    let newUser: INewUser = req.body;
    let user: IUser ={
        email: newUser.email.toLowerCase(),
        passwordHash: "",
        name: newUser.name.replace(/([^a-zA-Z0-9._#$!~-])/g, ""),
    }
    //secure their password
    if(newUser.password){
        const salt = bcrypt.genSaltSync(10);
        user.passwordHash = bcrypt.hashSync(newUser.password, salt); //has password
        delete newUser.password
    }else failureResponse("Incorrect body", {}, res);

    //Check db for existance
    let foundUser = await DbClient.db
}

export interface INewUser{
    name: string,
    email: string;
    password: string;
}
export interface IUser {
    _id?: any;
    email: string;
    name: string,
    passwordHash?: string;
  }