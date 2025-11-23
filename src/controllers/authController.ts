import { Request, Response } from "express";
import { Role, User } from "../model/userModel";
import bcrypt from "bcryptjs";


export const registerUser = async (req: Request, res: Response) => {
    try {
        const { fullname, email, password, address, phone, role } = req.body;

        if (!fullname || !email || !password || !address || !phone || role) {
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

        const hashedPassowrd = await bcrypt.hash(password, 10)
    } catch (err) {

    }
}