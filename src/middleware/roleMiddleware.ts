import { Response, NextFunction } from "express";
import { Role } from "../models/userModel";
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

        // convert Role enum to strings for comparison
        const roleStrings = roles.map(role => role.toString())
        
        const hasRole = req.user.roles?.some((userRole: string) => 
            roleStrings.includes(userRole)
        )


        if (!hasRole) {
            return res.status(403).json({
                // user is logged in but does not have permission
                message: `Require ${roles.join(", ")} role`
            })
        }

        next() 
    }    
    
}