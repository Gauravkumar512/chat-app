import express from 'express';
import cors from 'cors';
import http from 'http';    
import dotenv from 'dotenv';
dotenv.config()

import connectDb from './config/db';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import './config/passport';
import { initSocket } from './socket';
import healthcheck from "./routes/healthCheck.routes";
import auth from "./routes/auth.routes";
import room from "./routes/room.routes";
import message from "./routes/message.routes";
import { errorHandler } from './middleware/error.middleware';


const port = Number(process.env.PORT)
const app = express()

export const server = http.createServer(app);

initSocket(server)

app.use(cors({
    origin:  process.env.CLIENT_URL,
    credentials: true
}))
app.use(cookieParser())
app.use(passport.initialize())

// common middlewares

app.use(express.json())
app.use(express.urlencoded({extended: true, limit: '1mb'}))
app.use(express.static('public'))

app.get('/', (_req, res) => {
    return res.status(200).json({
        success: true,
        message: 'Chat backend is running',
        timestamp: new Date().toISOString()
    })
})

// routes
app.use('/api/healthcheck', healthcheck)
app.use('/api/auth', auth)
app.use('/api/room', room)
app.use('/api/message', message)

app.use(errorHandler)

const main = async ()=>{
    await connectDb()
    server.listen(port,()=>{
        console.log(`Server is running on port ${port}`);
    })
}

main()