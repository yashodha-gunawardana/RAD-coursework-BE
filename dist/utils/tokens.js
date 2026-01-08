"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signRefreshToken = exports.signAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
// load .env variables
dotenv_1.default.config();
const JWT_SECRET = process.env.JWT_SECRET;
// generate a JSON web token for a given user
const signAccessToken = (user) => {
    return jsonwebtoken_1.default.sign({
        // `sub` (subject) is a standard JWT claim for the user ID.
        sub: user._id.toString(),
        // `roles` stores the user's roles for access control
        roles: user.roles
    }, JWT_SECRET, {
        expiresIn: "1h"
    });
};
exports.signAccessToken = signAccessToken;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
// function to sign a new refresh token
const signRefreshToken = (user) => {
    return jsonwebtoken_1.default.sign({
        // set the 'sub' (subject) claim to user's ID as string
        sub: user._id.toString(),
    }, JWT_REFRESH_SECRET, // use the refresh token secret for signing
    {
        expiresIn: "7d"
    });
};
exports.signRefreshToken = signRefreshToken;
