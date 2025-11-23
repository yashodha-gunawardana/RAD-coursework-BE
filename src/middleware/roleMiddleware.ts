import { Response, NextFunction } from "express";
import { Role } from "../model/userModel";
import { AuthRequest } from "./authMiddleware";


// middleware to allow access only for specific roles
export const requiredRole = (roles: Role[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {

        // check if user is logged in
        if (!req.user) {
            return res.status(401).json({
                message: "Unauthorized.." // user is not logged in
            })
        }

        // check if user has at least one required role
        // some() checks if any role of the user matches allowed roles
        const hashRole = req.user.roles?.some((r: Role) => roles.includes(r))
    }    
    
    
}