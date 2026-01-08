"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleRefreshToken = exports.deleteUser = exports.rejectVendor = exports.approveVendor = exports.getAllUsers = exports.requestVendor = exports.getMyDetails = exports.loginUser = exports.registerUser = void 0;
const userModel_1 = __importStar(require("../models/userModel"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const tokens_1 = require("../utils/tokens");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const email_1 = require("../utils/email");
const vendorModel_1 = __importDefault(require("../models/vendorModel"));
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
// register user function
const registerUser = async (req, res) => {
    try {
        const { fullname, email, password } = req.body;
        if (!fullname || !email || !password) {
            return res.status(400).json({
                message: "All fields are required.."
            });
        }
        // only user and vendor roles allowed at registration
        /* if (role !== Role.USER && role !== Role.VENDOR) {
             return res.status(400).json({
                 message: "Invalid role. Only USER or VENDOR allowed during registration."
             })
         }*/
        const existingUser = await userModel_1.default.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                message: "Email already exists.."
            });
        }
        const hashedPassowrd = await bcryptjs_1.default.hash(password, 10);
        const newUser = new userModel_1.default({
            fullname,
            email,
            password: hashedPassowrd,
            // address,
            // phone,
            roles: [userModel_1.Role.USER],
            vendorStatus: userModel_1.VendorStatus.NOT_REQUESTED
        });
        await newUser.save();
        res.status(201).json({
            message: "Registration successfull..You can now log in.",
            data: {
                id: newUser._id,
                fullname: newUser.fullname,
                email: newUser.email,
                roles: newUser.roles,
                approved: newUser.vendorStatus
            }
        });
    }
    catch (err) {
        console.error("Registration error: ", err);
        res.status(500).json({
            message: "Server error during registration"
        });
    }
};
exports.registerUser = registerUser;
// login user function
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required.."
            });
        }
        // find the user in the database using the provided email
        const user = await userModel_1.default.findOne({ email });
        if (!user) {
            return res.status(401).json({
                message: "Invalid credentials.."
            });
        }
        // compare the entered passsword with the stored hashed password
        const valid = await bcryptjs_1.default.compare(password, user.password);
        if (!valid) {
            return res.status(401).json({
                message: "Invalid credentials.."
            });
        }
        // generate JWT access token for the authenticated user
        const accessToken = (0, tokens_1.signAccessToken)(user);
        res.status(200).json({
            message: "Login successfully..",
            data: {
                id: user._id,
                fullname: user.fullname,
                email: user.email,
                roles: user.roles,
                approved: user.vendorStatus,
                accessToken
            }
        });
    }
    catch (err) {
        console.error("Login error:", err);
        res.status(500).json({
            message: err?.message
        });
    }
};
exports.loginUser = loginUser;
// get own details function
const getMyDetails = async (req, res) => {
    try {
        if (!req.user?._id) {
            return res.status(401).json({
                message: "Unauthorized.."
            });
        }
        // req.user._id is now properly set by authMiddleware
        const user = await userModel_1.default.findById(req.user._id).select("-password");
        if (!user) {
            return res.status(404).json({
                message: "User not found.."
            });
        }
        res.status(200).json({
            message: "OK..",
            data: {
                id: user._id,
                fullname: user.fullname,
                email: user.email,
                roles: user.roles,
                approved: user.vendorStatus
            }
        });
    }
    catch (err) {
        console.error("Get my details error:", err);
        res.status(500).json({
            message: err?.message || "Server error"
        });
    }
};
exports.getMyDetails = getMyDetails;
// request to become vendor
const requestVendor = async (req, res) => {
    try {
        if (!req.user?._id) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }
        const user = await userModel_1.default.findById(req.user._id);
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }
        if (user.vendorStatus === userModel_1.VendorStatus.PENDING) {
            return res.status(400).json({
                message: "Your vendor request is already pending"
            });
        }
        if (user.vendorStatus === userModel_1.VendorStatus.APPROVED) {
            return res.status(400).json({
                message: "You are already and approved vendor"
            });
        }
        user.vendorStatus = userModel_1.VendorStatus.PENDING;
        await user.save();
        res.status(200).json({
            message: "Vendor request sumbitted successfully, Awaiting admin approval.",
            data: { VendorStatus: user.vendorStatus }
        });
    }
    catch (err) {
        console.error("Vendor request error:", err);
        res.status(500).json({
            message: "Server error"
        });
    }
};
exports.requestVendor = requestVendor;
// get all users
const getAllUsers = async (req, res) => {
    try {
        const users = await userModel_1.default.find({}).select("-password");
        const formattedUsers = users.map(user => ({
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            roles: user.roles,
            vendorStatus: user.vendorStatus,
        }));
        res.status(200).json({
            message: "Users fetched successfully",
            data: formattedUsers
        });
    }
    catch (err) {
        console.error("Get all users error:", err);
        res.status(500).json({
            message: "Server error"
        });
    }
};
exports.getAllUsers = getAllUsers;
// approved vendor request
/*export const approveVendor = async (req: AuthRequest, res: Response) => {
    try {

        if (!req.user?.roles.includes(Role.ADMIN)) {
            return res.status(403).json({
                message: "Only admin can approv vendor request"
             })
        }

        const { id } = req.params

        const user = await User.findById(id)
        if (!user) {
            return res.status(404).json({
                message: "User not found."
            })
        }

        if (user.vendorStatus !== VendorStatus.PENDING) {
            return res.status(400).json({
                message: "No pending vendor request for this user"
            })
        }


        // vendor role approve
        if (!user.roles.includes(Role.VENDOR)) {
            user.roles.push(Role.VENDOR)
        }

        user.vendorStatus = VendorStatus.APPROVED
        await user.save()

        await sendEmail(
            user.email,
            "Vendor Requset Approved",
            `Congratulations, ${user.fullname}! Your request to become a vendor has been approved.
                You now have full access to vendor features.`
        )
        res.status(200).json({
            message: "Vendor request approved successfully"
        })

    } catch (err) {
        console.error("Approve vendor error:", err)
        res.status(500).json({
            message: "Server error"
        })
    }
}


// reject vendor request
export const rejectVendor = async (req: AuthRequest, res: Response) => {
    try {

        if (!req.user?.roles.includes(Role.ADMIN)) {
            return res.status(403).json({
                message: "Only admin can reject vendor request"
             })
        }

        const { id } = req.params

        const user = await User.findById(id)
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            })
        }

        if (user.vendorStatus !== VendorStatus.PENDING) {
            return res.status(400).json({
                message: "No pending vendor request for this user"
            })
        }


        // remove vendor role rejection
        user.vendorStatus = VendorStatus.REJECTED
        await user.save()

        
        await sendEmail(
            user.email,
            "Vendor Request Rejected",
            `Dear ${user.fullname}, unfortunately your request to become a vendor has been rejected.
                Please contact support for more information.`
        )
        res.status(200).json({
            message: "Vendor request rejected"
        })

    } catch (err) {
        console.error("Reject vendor error:", err)
        res.status(500).json({
            message: "Server error"
        })
    }
}*/
// approved vendor request
const approveVendor = async (req, res) => {
    try {
        if (!req.user?.roles.includes(userModel_1.Role.ADMIN)) {
            return res.status(403).json({
                message: "Only admin can approve vendor request"
            });
        }
        const { id } = req.params;
        const user = await userModel_1.default.findById(id);
        if (!user) {
            return res.status(404).json({
                message: "User not found."
            });
        }
        if (user.vendorStatus !== userModel_1.VendorStatus.PENDING) {
            return res.status(400).json({
                message: "No pending vendor request for this user"
            });
        }
        // Add VENDOR role if not already present
        if (!user.roles.includes(userModel_1.Role.VENDOR)) {
            user.roles.push(userModel_1.Role.VENDOR);
        }
        user.vendorStatus = userModel_1.VendorStatus.APPROVED;
        await user.save();
        // Send email — failure won't crash the approval
        try {
            const existingVendor = await vendorModel_1.default.findOne({
                $or: [
                    { userId: user._id },
                    { addedBy: user._id }
                ]
            });
            if (!existingVendor) {
                const newVendor = new vendorModel_1.default({
                    name: user.fullname,
                    category: "OTHER", // Default category
                    contact: user.email,
                    priceRange: "Contact for pricing",
                    description: `Vendor profile for ${user.fullname}`,
                    isAvailable: true,
                    addedBy: req.user._id, // Admin who approved
                    userId: user._id // Link to vendor user
                });
                await newVendor.save();
                console.log(`✅ Created vendor profile for user: ${user.email}`);
            }
        }
        catch (vendorErr) {
            console.error("Failed to create vendor profile:", vendorErr);
            // Don't fail the whole request if vendor creation fails
        }
        // Send email
        try {
            await (0, email_1.sendEmail)(user.email, "Vendor Request Approved", `Congratulations, ${user.fullname}!\n\nYour request to become a vendor has been approved.\nYou now have full access to vendor features.`);
        }
        catch (emailErr) {
            console.error("Approval email failed for:", user.email, emailErr);
        }
        res.status(200).json({
            message: "Vendor request approved successfully"
        });
    }
    catch (err) {
        console.error("Approve vendor error:", err);
        res.status(500).json({
            message: "Server error"
        });
    }
};
exports.approveVendor = approveVendor;
// reject vendor request
const rejectVendor = async (req, res) => {
    try {
        if (!req.user?.roles.includes(userModel_1.Role.ADMIN)) {
            return res.status(403).json({
                message: "Only admin can reject vendor request"
            });
        }
        const { id } = req.params;
        const user = await userModel_1.default.findById(id);
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }
        if (user.vendorStatus !== userModel_1.VendorStatus.PENDING) {
            return res.status(400).json({
                message: "No pending vendor request for this user"
            });
        }
        user.vendorStatus = userModel_1.VendorStatus.REJECTED;
        await user.save();
        // Send rejection email — safe from failure
        try {
            await (0, email_1.sendEmail)(user.email, "Vendor Request Rejected", `Dear ${user.fullname},\n\nUnfortunately, your request to become a vendor has been rejected.\nPlease contact support for more information.`);
        }
        catch (emailErr) {
            console.error("Rejection email failed for:", user.email, emailErr);
        }
        res.status(200).json({
            message: "Vendor request rejected successfully"
        });
    }
    catch (err) {
        console.error("Reject vendor error:", err);
        res.status(500).json({
            message: "Server error"
        });
    }
};
exports.rejectVendor = rejectVendor;
// delete users
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        if (!req.user?.roles.includes(userModel_1.Role.ADMIN)) {
            return res.status(403).json({
                message: "Only admin can delete users"
            });
        }
        const user = await userModel_1.default.findById(id);
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({
                message: "Admin cannot delete themselves"
            });
        }
        await userModel_1.default.findByIdAndDelete(id);
        res.status(200).json({
            message: "User deleted successfully",
            data: {
                id: user._id,
                fullname: user.fullname,
                email: user.email
            }
        });
    }
    catch (err) {
        console.error("Delete user error:", err);
        res.status(500).json({
            message: "Server error"
        });
    }
};
exports.deleteUser = deleteUser;
// refresh token & generate a new access token function
const handleRefreshToken = async (req, res) => {
    try {
        // get the refresh token sent by the client
        const { token: refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({
                message: "Refresh token required.."
            });
        }
        // Verify the token using JWT_REFRESH_SECRET
        // jwt.verify will decode the token and check its validity
        const payload = jsonwebtoken_1.default.verify(refreshToken, JWT_REFRESH_SECRET);
        // Find user in database by ID from token payload
        const user = await userModel_1.default.findById(payload.sub);
        if (!user) {
            return res.status(400).json({
                message: "Invalid refresh token.."
            });
        }
        // generate a new access token 
        const accessToken = (0, tokens_1.signAccessToken)(user);
        res.status(200).json({
            accessToken
        });
    }
    catch (err) {
        res.status(403).json({
            message: "Invalid or expired token.."
        });
    }
};
exports.handleRefreshToken = handleRefreshToken;
