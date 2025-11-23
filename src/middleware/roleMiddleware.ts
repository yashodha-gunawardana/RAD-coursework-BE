import { Response, NextFunction } from "express";
import { Role } from "../model/userModel";
import { AuthRequest } from "./authMiddleware";


// middleware to allow access only for specific roles
export const requiredRole = (roles: Role[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {

        // check if user is logged in
        if (!req.user) {
            return res.status(401).json({
                message: "Unauthorized.."
            })
        }
    }    
    
    
}