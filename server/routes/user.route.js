import express from "express"
import isAuth from "../middlewares/isAuth.js"
import { getCurrentUser, addTrialCredits } from "../controllers/user.controller.js"


const userRouter = express.Router()

userRouter.get("/current-user",isAuth,getCurrentUser)
userRouter.post("/add-trial-credits",isAuth,addTrialCredits)

export default userRouter