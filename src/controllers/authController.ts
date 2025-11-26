import { Request, Response } from "express";
import { Role, User, Status, IUser } from "../model/userModel";
import bcrypt from "bcryptjs";
import { signAccessToken } from "../utils/tokens";
import { AuthRequest } from "../middleware/authMiddleware";
import { data } from "react-router-dom";

// register user function
export const registerUser = async (req: Request, res: Response) => {
    try {
        const { fullname, email, password, address, phone, role} = req.body;

        if (!fullname || !email || !password || !address || !phone) {
            return res.status(400).json({
                message: "All fields are required.."
            })
        }

        // only user and vendor roles allowed at registration
        if (role !== Role.USER && role !== Role.VENDOR) {
            return res.status(400).json({
                message: "Invalid role.."
            })
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                message: "Email already exists.."
            })
        }

        const hashedPassowrd = await bcrypt.hash(password, 10);

        // vendor needs a admin approval
        const approvelStatus = role == Role.VENDOR ? Status.PENDING : Status.APPROVED;

        const newUser = new User({
            fullname,
            email,
            password: hashedPassowrd,
            address,
            phone,
            roles: [role],
            approved: approvelStatus
        })
        await newUser.save();

        res.status(201).json({
            message: 
                role == Role.VENDOR
                    ? "Vendor registered successfully, Waiting for approval.."
                    : "User registered successfully..",
            data: {
                id: newUser._id,
                email: newUser.email,
                roles: newUser.roles,
                approved: newUser.approved
            }        
        })

    } catch (err: any) {
        res.status(500).json({
            message: err?.message
        })
    }
}


// login user function
export const loginUser = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body

        // find the user in the database using the provided email
        const existingUser = await User.findOne({ email })

        if (!existingUser) {
            return res.status(401).json({
                message: "Invalid credentials.."
            })
        }

        // compare the entered passsword with the stored hashed password
        const valid = await bcrypt.compare(password, existingUser.password)

        if (!valid) {
            return res.status(401).json({
                message: "Invalid credentials.."
            })
        }

        // generate JWT access token for the authenticated user
        const accessToken = signAccessToken(existingUser)

        res.status(200).json({
            message: "Login successfully..",
            data: {
                email: existingUser.email,
                roles: existingUser.roles,
                accessToken
            }
        })

    } catch (err: any) {
        res.status(500).json({
            message: err?.message
        })
    }
}


// get own details function
export const getMyDetails = async (req: AuthRequest, res: Response) => {
    if (!req.user) {
        return res.status(401).json({
            message: "Unauthorized.."
        })
    }

    // get user id from JWT payload
    const userId = req.user.sub

    // find user in database using ID and exclude password field
    const user = ((await User.findById(userId).select("-password")) as IUser) || null

    if (!user) {
        return res.status(404).json({
            message: "User not found.."
        })
    }

    // extract only safe fields to send frontend
    const { fullname, email, address, phone, roles, approved } = user

    res.status(200).json({
        message: "OK..",
        data: { fullname, email, address, phone, roles, approved }
    })
}


// refresh token & generate a new access token function
export const handleRefreshToken = async (req: Request, res: Response) => {
    try {
        // get the refresh token sent by the client
        const { token } = req.body

        if (!token) {
            return res.status(400).json({
                message: "Token required.."
            })
        }

        const payload = jwt.verify(token, JWT_REFRESH_SECRET)

    } catch (err) {

    }
}

