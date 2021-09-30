import { authenticate, noAuth } from '../auth/auth-helper';
import { Router } from 'express';
import { UserController } from '../controllers'
export const router = Router({
    strict: true,
})

//Create a user
router.post('/', UserController.createUser);

//Login
router.post('/login', UserController.login);

//check if user has verified email
router.post('/email-verified', UserController.isEmailVerified);

// set status for EMAIL validation (not like a pro verified user)
router.put('/profile/updateverificationstatus/:id', UserController.updateUserVerificationStatus);

