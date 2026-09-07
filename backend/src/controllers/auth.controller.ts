import asyncHandler from "../utils/AsyncHandler";
import ApiResponse from "../utils/ApiResponse";
import ApiError from "../utils/ApiError";
import type { CookieOptions } from "express";
import type { Request, Response } from "../types/index";
import { User, type IUser } from "../models/User";

const authCookieOptions = (): CookieOptions => {
    const isProd = process.env.NODE_ENV === "production";
    return {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
    };
};

const generateAccessAndRefreshToken = async (user: IUser) => {
    try {
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})

        return ({accessToken, refreshToken})

    } catch (error: any) {
        throw new ApiError(500, error?.message || "Internal server error")
    }
}

const buildOAuthRedirect = (accessToken: string) => {
    const callbackUrl = new URL(`${process.env.CLIENT_URL}/oauth`)
    callbackUrl.searchParams.set("accessToken", accessToken)
    return callbackUrl.toString()
}

export const registerUser = asyncHandler(async (req: Request,res: Response)=>{

    const {username,email, password} = req.body

    const userExist = await User.findOne({
        $or: [{username},{email}]
    })

    if(userExist){
        throw new ApiError(400, "User already exist")
    }

    const user = await User.create({
        username,
        email,
        password
    })

    const accessToken = user.generateAccessToken()

    const option = authCookieOptions()

    return res
            .status(201)
            .cookie("accessToken", accessToken, option)
            .json(new ApiResponse(201, "User registered successfully", {
                user: {
                    _id: user._id,
                    username: user.username,
                    email: user.email,
                    avatar: user.avatar,
                },
                accessToken,
                refreshToken: null,
            }))

})


export const loginUser = asyncHandler(async (req: Request,res: Response)=>{

    const {email,password} = req.body

    const user = await User.findOne({email})

    if(!user){
        throw new ApiError(404, "User not found")
    }

    if (!user.password) {
    throw new ApiError(400, "Please login with Google")
    }

    const comparePassword = await user.comparePassword(password)

    if(!comparePassword){
        throw new ApiError(400, "Invalid credentials")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user)

    const option = authCookieOptions()

    return res
            .status(200)
            .cookie("accessToken", accessToken, option)
            .cookie("refreshToken", refreshToken, option)
            .json(new ApiResponse(200, "User logged in successfully", {
                user: {
                    _id: user._id,
                    username: user.username,
                    email: user.email,
                    avatar: user.avatar,
                },
                accessToken,
                refreshToken,
            }))
})

export const logoutUser = asyncHandler(async (req: Request,res: Response)=>{

    if (req.user?._id) {
        await User.findByIdAndUpdate(
            req.user._id,
            {$unset: {refreshToken: 1}},
            {new: true}
        )
    }

    const option = authCookieOptions()

    return res 
            .status(200)
            .clearCookie("accessToken", option)
            .clearCookie("refreshToken", option)
            .json(new ApiResponse(200,"User logged out successfully"))
})


export const currentUser = asyncHandler(async (req: Request,res: Response)=>{

    return res.status(200).json(new ApiResponse(200, "Current user fetched successfully", req.user))
})


export const googleCallback = async (req: Request, res: Response) => {
    try {
        const user = req.user as IUser;

        if (!user) {
            return res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`);
        }

        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user);

        const option = authCookieOptions();

        return res
            .cookie("accessToken", accessToken, option)
            .cookie("refreshToken", refreshToken, option)
            .redirect(buildOAuthRedirect(accessToken));
    } catch (error) {
        return res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`);
    }
};

export const githubCallback = async (req: Request, res: Response) => {
    try {
        const user = req.user as IUser;

        if (!user) {
            return res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`);
        }

        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user);

        const option = authCookieOptions();

        return res
            .cookie("accessToken", accessToken, option)
            .cookie("refreshToken", refreshToken, option)
            .redirect(buildOAuthRedirect(accessToken));
    } catch (error) {
        return res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`);
    }
};