import * as jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { rejects } from 'assert';
dotenv.config();

export const authenticate = async (req: Request, res: Response, next) => {
    let apiKey = req.headers['apiKey'];
    if (process.env.API_KEY && apiKey === process.env.API_KEY) {
        req.userId = req.body.userId;
        next();
        return;
    }
    let token = req.headers['authorization'];
    decodeJwt(token).then(async (decodedToken: any) => {
        if (decodedToken && decodedToken.data) {
            if (decodedToken.data._id) {
                req.userId = decodedToken.data._id
                req.username = decodedToken.data.username
            } else {
                res.sendStatus(403);
            }
        } else {
            res.sendStatus(401);
        }
    })
}

export const authenticateRole = (role) => {
    return async (req: Request, res: Response, next) => {
        let token = req.headers['authorization'];
        decodeJwt(token).then((decodedToken: any) => {
            if (decodedToken && decodedToken.data) {
                if (decodedToken.data.roles.includes(res)) {
                    req.userId = decodedToken.data._id
                    req.username = decodedToken.data.username
                    next()
                } else {
                    res.sendStatus(403);
                }
            } else {
                res.sendStatus(401);
            }
        })
    }
}

export const noAuth = async (req: Request, res: Response, next) => {
    let token = req.headers['authorization'];
    if (token) {
        decodeJwt(token).then((decodedToken: any) => {
            if (decodedToken && decodedToken.data) {
                if (decodedToken.data._id) {
                    req.userId = decodedToken.data._id
                    req.username = decodedToken.data.username
                }
                next();
            }
        }).catch(err => {
            next();
        });
    } else {
        next();
    }

};

export const generateAccessToken = (data: any) => {
    // expires after an hour (3600 seconds = 60 minutes)
    return jwt.sign(
        {
            data: {
                _id: data._id,
                username: data.username,
                roles: data.roles
            }
        },
        process.env.TOKEN_SECRET,
        {
            expiresIn: '30d',
        }
    );
};

const decodeJwt = async (authHeader: any) => {
    return new Promise((resolve, reject) => {
        // Gather the jwt access token from the request header
        const token = authHeader && authHeader.split(' ')[1];
        if (token == null) {
            resolve(null);
        }
        jwt.verify(token, process.env.TOKEN_SECRET, (err: any, decodedJwt: any) => {
            if (err) {
                resolve(null);
            }
            resolve(decodedJwt);
        });
    });
};