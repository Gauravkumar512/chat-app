import z from "zod";
import { ZodSchema } from "zod";
import {Request, Response,NextFunction} from "../types/index"
import ApiError from "./ApiError";

// register validation

export const registerSchema = z.object({
    username: z
                .string({ message: "Username is required" })
                .min(3, { message: "Username must be at least 3 characters" })
                .max(20, { message: "Username must be at most 20 characters" })
                .regex(/^[a-zA-Z0-9_]+$/, { message: "Username can only contain letters, numbers, and underscores" }),
    email: z
                .string({ message: "Email is required" })
                .email({ message: "Invalid email address" }),
    password: z
                .string({ message: "Password is required" })
                .min(6, { message: "Password must be at least 6 characters" })
                .max(50, { message: "Password must be at most 50 characters" }),
    avatar: z
                .string()
                .url({ message: "Avatar must be a valid URL" })
                .optional()
})


// login validation

export const loginSchema = z.object({
    email: z
            .string({ message: "Email is required" })
            .email({ message: "Invalid email address" }),
    password: z
            .string({ message: "Password is required" }) 
            .min(6, { message: "Password must be at least 6 characters" })
            .max(50, { message: "Password must be at most 50 characters" })
})

export const roomSchema = z.object({
        name: z
            .string({ message: "Room name is required" })
            .min(3, { message: "Room name must be at least 3 characters" })
            .max(20, { message: "Room name must be at most 20 characters" }),
            
        description: z
            .string({ message: "Description must be a string" })
            .max(200, { message: "Description must be at most 200 characters" })
            .optional()

})



export const validateSchema = (schema: ZodSchema) => {
        return (req: Request, res: Response, next: NextFunction) => {
     
        const result = schema.safeParse(req.body)

        if(!result.success) {
                const errors: any = result.error.issues.map((err) => err.message)
                return next(new ApiError(400, "Validation error", errors))
        }

        req.body = result.data
        next()
}}