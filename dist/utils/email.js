"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const sendEmail = async (to, subject, text) => {
    try {
        const transporter = nodemailer_1.default.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 587,
            seccure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
        await transporter.sendMail({
            from: `"Event System" <${process.env.SMTP_USER}>`,
            to,
            subject,
            text
        });
        console.log(`Email sent to ${to} with subject "${subject}"`);
    }
    catch (err) {
        console.error("Failed to send email:", err.message);
        throw new Error("Email could not be sent");
    }
};
exports.sendEmail = sendEmail;
