import { Request, Response } from "express";
import { User } from "../model/userModel";


export const registerUser = async (req: Request, res: Response) => {
    try {
        const { fullname, email, password, address, phone, role } = req.body;

        if (!fullname || !email || !password || !address || !phone || role) {
            return res.status(400).json({
                message: "All fields are required.."
            })
        }
    } catch (err) {

    }
}