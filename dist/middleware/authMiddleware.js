"use strict";
/*import { Request, Response, NextFunction } from "express";
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
        console.log("Authenticated user:", req.user._id); // ← Add this log
        next();
    } catch (err) {
        res.status(403).json({
            message: "Invalid or expired token.."
        })
    }
}*/
// middleware/authMiddleware.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userModel_1 = __importDefault(require("../models/userModel"));
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
}
const authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token provided" });
    }
    const token = authHeader.split(" ")[1];
    try {
        // Verify token - payload will have 'sub' and 'roles'
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        if (!decoded.sub) {
            return res.status(401).json({ message: "Invalid token: missing user ID" });
        }
        // Find user
        const user = await userModel_1.default.findById(decoded.sub).select("-password");
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }
        // Attach to request
        req.user = {
            _id: user._id.toString(),
            roles: user.roles,
        };
        console.log("Authenticated user ID:", req.user._id, "Roles:", req.user.roles);
        next();
    }
    catch (err) {
        console.error("JWT Error:", err.message);
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Token expired" });
        }
        return res.status(401).json({ message: "Invalid token" });
    }
};
exports.authenticate = authenticate;
