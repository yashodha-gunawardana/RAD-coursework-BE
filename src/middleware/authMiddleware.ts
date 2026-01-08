import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/userModel";


const JWT_SECRET = process.env.JWT_SECRET as string

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables")
}

export interface AuthRequest extends Request {
    user?: {
        _id: string;
        roles: string[];
    }
}

// midlleware function to authenticate requests
export const authenticate = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
       
    // reads the authorization header from the incoming http request
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ 
            message: "No token provided" 
        })
    }

    const token = authHeader.split(" ")[1]

    try {
        // Verify token - payload will have 'sub' and 'roles'
        const decoded = jwt.verify(token, JWT_SECRET) as { sub: string; roles: string[] }

        if (!decoded.sub) {
            return res.status(401).json({ 
                message: "Invalid token: missing user ID" 
            })
        }

        // find user
        const user = await User.findById(decoded.sub).select("-password")

        if (!user) {
            return res.status(401).json({ 
                message: "User not found" 
            })
        }

        // attach to request
        req.user = {
            _id: user._id.toString(),
            roles: user.roles,
        }

        console.log("Authenticated user ID:", req.user._id, "Roles:", req.user.roles)

        next()

    } catch (err: any) {
        console.error("JWT Error:", err.message)

        if (err.name === "TokenExpiredError") {
            return res.status(401).json({ 
                message: "Token expired" 
            })
        }

        return res.status(401).json({ 
            message: "Invalid token" 
        })
    }
};