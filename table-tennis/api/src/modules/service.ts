import { Response } from 'express';
import { response_status_codes } from '../modules/models';

export function successResponse(message: string, DATA: any, res: Response) {
    res.status(response_status_codes.success).json({
        STATUS: 'SUCCESS',
        MESSAGE: message,
        DATA
    });
}

export function failureResponse(message: string, DATA: any, res: Response) {
    res.status( response_status_codes.internal_server_error).json({
        STATUS: 'FAILURE',
        MESSAGE: message,
        DATA
    });
}

export function MongoError(err: any, res: Response){
    res.status(response_status_codes.internal_server_error).json({
        STATUS: 'FAILURE',
        MESSAGE: 'MongoDB error',
        DATA: err
    });
}