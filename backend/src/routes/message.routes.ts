import { getMessages } from "../controllers/message.controller";
import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware";

const router = Router()

router.route('/:roomId').get(verifyToken,getMessages)

export default router