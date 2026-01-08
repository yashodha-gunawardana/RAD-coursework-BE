"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requiredRole = void 0;
// middleware to allow access only for specific roles
const requiredRole = (roles) => {
    return (req, res, next) => {
        // check if user is logged in
        if (!req.user) {
            return res.status(401).json({
                message: "Unauthorized.." // user is not logged in
            });
        }
        // check if user has at least one required role
        // some() checks if any role of the user matches allowed roles
        // const hashRole = req.user.roles?.some((r: Role) => roles.includes(r))
        // Convert Role enum to strings for comparison
        const roleStrings = roles.map(role => role.toString());
        const hasRole = req.user.roles?.some((userRole) => roleStrings.includes(userRole));
        if (!hasRole) {
            return res.status(403).json({
                // user is logged in but does not have permission
                message: `Require ${roles.join(", ")} role`
            });
        }
        next(); // if user is authenticated and has correct role allow req to continue
    };
};
exports.requiredRole = requiredRole;
