declare namespace Express {
    interface Request {
        userId?: string,
        files: any
        username?: string;
        alreadyPaid?:boolean;
    }
}
