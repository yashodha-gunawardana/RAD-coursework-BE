import { IUser } from "../model/userModel";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

// load .env variables
dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET as string
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string

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

// function to sign a new refresh token
export const signRefreshToken = (user: IUser): string => {

}