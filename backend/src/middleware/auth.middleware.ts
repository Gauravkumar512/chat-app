import {Request,Response,NextFunction} from "../types/index"
import jwt from "jsonwebtoken"
import { User } from "../models/User"
import asyncHandler from "../utils/AsyncHandler"
import ApiError from "../utils/ApiError"

interface JwtPayload {
    _id: string
}

export const verifyToken = asyncHandler(async(req: Request, res: Response, next: NextFunction)=>{
    
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

    if(!token){
        throw new ApiError(401, "Unauthorized")
    }

    let decoded: JwtPayload

    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET_KEY as string) as JwtPayload
    } catch (error) {
        throw new ApiError(401, "Invalid token")
    }

    
    const user = await User.findById(decoded._id).select("-password -refreshToken")
    if(!user){
        throw new ApiError(404, "User not found")
    }

    req.user = user
    next()
})