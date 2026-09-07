import { healthcheck } from "../controllers/healthCheck.controller";
import { Router } from "express";


const router = Router()

router.route('/').get(healthcheck)

export default router