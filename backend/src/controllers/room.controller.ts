import asyncHandler from "../utils/AsyncHandler";
import ApiResponse from "../utils/ApiResponse";
import ApiError from "../utils/ApiError";
import type { Request, Response, RoomCreatedPayload } from "../types/index";
import { Room } from "../models/Room";
import { io } from "../socket";


export const createRoom = asyncHandler(async (req: Request,res: Response)=>{

    const {name, description} = req.body
    const userId = req.user?._id

    if(!userId){
        throw new ApiError(401, "Unauthorized")
    }

    const roomExist = await Room.findOne({name})

    if(roomExist){
        throw new ApiError(400, "Room already exist")
    }

    const room = await Room.create({
        name,
        description,
        createdBy: userId,
    });

    const populated = await Room.findById(room._id)
        .populate("createdBy", "username email")
        .lean();

    if (io && populated) {
        io.emit("room-created", {
            room: populated as unknown as RoomCreatedPayload,
        });
    }

    return res
        .status(201)
        .json(new ApiResponse(201, "Room created successfully", populated ?? room));
})

export const getAllRooms = asyncHandler(async (req: Request, res: Response)=>{

    const room = await Room.find().populate("createdBy", "username email").sort({createdAt: -1})

    return res.status(200).json(new ApiResponse(200, "Rooms fetched successfully", room))
})


export const deleteRoom = asyncHandler(async (req: Request, res: Response)=>{

    let { id } = req.params;
    if (!id || Array.isArray(id)) {
        throw new ApiError(400, "Invalid room id");
    }
    const userId = req.user?._id

    if(!userId){
        throw new ApiError(401, "Unauthorized")
    }

    const room = await Room.findById(id as string)

    if(!room){
        throw new ApiError(404, "Room not found")
    }

    if(room.createdBy.toString() !== userId.toString()){
        throw new ApiError(403, "You are not authorized to delete this room")
    }

    await room.deleteOne();

    if (io) {
        io.emit("room-deleted", { id });
    }

    return res.status(200).json(new ApiResponse(200, "Room deleted successfully"))

})

export const getRoomById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const room = await Room.findById(id).populate("createdBy", "username email");

    if (!room) {
        throw new ApiError(404, "Room not found");
    }

    return res.status(200).json(new ApiResponse(200, "Room fetched successfully", room));
});