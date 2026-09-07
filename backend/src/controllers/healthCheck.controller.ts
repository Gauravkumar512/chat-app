import asyncHandler from "../utils/AsyncHandler";
import ApiResponse from "../utils/ApiResponse";
import { Request, Response } from "express";

export const healthcheck  = asyncHandler(async (req: Request,res: Response)=>{
    try {
        console.log("Server is healthy");
        return res
                .status(200)
                .json(new ApiResponse(200, "Server is healthy", null))
            

    } catch (error) {
        console.log(error);
    }
})