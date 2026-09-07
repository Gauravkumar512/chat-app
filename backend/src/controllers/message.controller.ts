import asyncHandler from "../utils/AsyncHandler";
import ApiResponse from "../utils/ApiResponse";
import ApiError from "../utils/ApiError";
import type { Request, Response } from "../types/index";
import { Message } from "../models/Message";


export const getMessages = asyncHandler(async (req: Request,res: Response)=>{

    const {roomId} = req.params

    if(!roomId){
        throw new ApiError(400, "Room not found")
    }

    const message = await Message.find({room: roomId})
    .populate("sender", "username avatar")
    .sort({createdAt: 1})
    .limit(50);

    return res.status(200).json(new ApiResponse(200, "Messages fetched successfully", message))
})