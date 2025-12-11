import { IUser } from "../models/userModel";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

// load .env variables
dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET as string

// generate a JSON web token for a given user
export const signAccessToken = (user: IUser): string => {
    return jwt.sign(
        {
            // `sub` (subject) is a standard JWT claim for the user ID.
            sub: user._id.toString(),

            // `roles` stores the user's roles for access control
            roles: user.roles
        },
        JWT_SECRET,

        {
            expiresIn: "30m"
        }
    )
}

const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string

// function to sign a new refresh token
export const signRefreshToken = (user: IUser): string => {
    return jwt.sign(
        {
            // set the 'sub' (subject) claim to user's ID as string
            sub: user._id.toString(),
        },
        JWT_REFRESH_SECRET, // use the refresh token secret for signing

        {
            expiresIn: "7d"
        }
    )
}