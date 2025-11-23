import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as string;

export interface AuthRequest extends Request {
    user?: any
}

// midlleware function to authenticate requests
export const authenticate = (
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
    } catch (err) {

    }
}