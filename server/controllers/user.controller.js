import User from "../models/user.model.js"


export const getCurrentUser = async (req,res) => {
    try {
        const userId = req.userId
        const user = await User.findById(userId)
        if(!user) {
            return res.status(404).json({message:"user does not found"})
        }
        return res.status(200).json(user)
    } catch (error) {
         return res.status(500).json({message:`failed to get currentUser ${error}`})
    }
}

export const addTrialCredits = async (req,res) => {
    try {
        const userId = req.userId
        const user = await User.findById(userId)
        if(!user) {
            return res.status(404).json({message:"user does not found"})
        }
        
        if(user.credits >= 50) {
            return res.status(400).json({message:"You already have enough credits"})
        }
        
        user.credits = 100
        await user.save()
        
        return res.status(200).json({message:"100 trial credits added", user})
    } catch (error) {
         return res.status(500).json({message:`failed to add trial credits ${error}`})
    }
}