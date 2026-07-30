import express from "express"
import { googleAuth, logOut, checkEmail } from "../controllers/auth.controller.js"
import { checkEmailRateLimit } from "../middlewares/rateLimiter.js"

const authRouter = express.Router()


authRouter.post("/google", googleAuth)
authRouter.post("/check-email", checkEmailRateLimit, checkEmail)
authRouter.get("/logout", logOut)


export default authRouter