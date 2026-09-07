import {Request,Response,NextFunction} from  "../types/index"
import ApiError from "../utils/ApiError"

export const errorHandler = (err: any , req: Request , res: Response , next: NextFunction)=>{
    let error = err

    if(!(error instanceof ApiError)){
        const statusCode = error.statusCode || 500
        const message = error.message || "Internal Server Error"
        error = new ApiError(statusCode,message,error?.errors || [])
    }

    return res.status(error.statusCode).json({
        success: error.success,
        message: error.message,
        error: error.errors,

        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })

}