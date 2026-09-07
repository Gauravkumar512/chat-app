import mongoose from "mongoose";
import ApiError from "../utils/ApiError";

export const connectDb = async ()=>{
    try {
        const mongoUrl = process.env.MONGO_URL;

        if (!mongoUrl) {
            throw new ApiError(500, "MONGO_URL is not defined in environment variables");
        }

        const conn = await mongoose.connect(mongoUrl as string);
        console.log(`MongoDB Connected: ${conn.connection.host}`);

    } catch (error: unknown) {
        
        const errorMessage = error instanceof Error ? error.message : "Unknown error";

        console.error("Failed to connect to the database:", errorMessage);
        process.exit(1); // Exit the process with a failure code
        
    }
}

export default connectDb