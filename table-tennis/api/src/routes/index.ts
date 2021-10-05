import { Router } from "express";
import { router as userRouter } from "../routes/user.router";
import { router as commonRouter } from "../routes/common.router";
const router = Router()

router.use('/user', userRouter )
router.use(commonRouter)

export default router