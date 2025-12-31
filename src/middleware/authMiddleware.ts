import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User, { Role } from "../models/userModel";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as string;

export interface AuthRequest extends Request {
    // user?: any
    user?: {
        _id: string
        roles: Role[]
    }
}

// midlleware function to authenticate requests
export const authenticate = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    // reads the authorization header from the incoming http request.
    // excepted format("Bearer <JWT token>")
    const authHeader = req.headers.authorization
    if (!authHeader) {
        return res.status(401).json({
            message: "No token provided.."
        })
    }

    const token = authHeader.split(" ")[1] 
    try {
        const payload = jwt.verify(token, JWT_SECRET)
        // req.user = payload
        const user = await User.findById(payload.sub).select("-password");
        // next()
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        req.user = {
            _id: user._id.toString(),
            roles: user.roles || []
            
        }
        next();
    } catch (err) {
        res.status(403).json({
            message: "Invalid or expired token.."
        })
    }
}