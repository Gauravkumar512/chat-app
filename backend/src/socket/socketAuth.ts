import jwt, {JwtPayload} from "jsonwebtoken";
import { Socket } from "socket.io";

interface customJwtPayload extends JwtPayload{
    _id: string;
    username: string;
}


const socketAuth = (socket: Socket, next: (err?: Error)=> void) =>{

    const handshakeToken = socket.handshake.auth?.token
    const authorization = socket.handshake.headers.authorization
    const cookie = socket.handshake.headers.cookie as string | undefined

    const accessToken =
        (typeof handshakeToken === "string" && handshakeToken) ||
        (typeof authorization === "string" ? authorization.replace(/^Bearer\s+/i, "") : undefined) ||
        cookie?.split("; ").find((c) => c.trim().startsWith("accessToken="))?.split("=")[1]

    if(!accessToken){
        return next(new Error("Unauthorized"))
    }

    try {
        const decoded = jwt.verify(accessToken, process.env.JWT_SECRET_KEY as string) as customJwtPayload

        socket.data.user = {
            _id: decoded._id,
            username: decoded.username,
        }
        
        next()
    } catch (error: any) {
        next(new Error(`Invalid cookie: ${error.message}`));
    }


}

export default socketAuth