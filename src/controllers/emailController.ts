import { Request, Response } from "express";
import { sendEmail } from "../utils/email"; 


export const testSendEmail = async (req: Request, res: Response) => {
    try {
        const to = "yashodagunawardhana15@gmail.com"
        const subject = "Test Email from Event System"
        const text = "Hello! This is a test email from your project."

        await sendEmail(to, subject, text)

        res.status(200).json({ 
            message: "Test email sent successfully!" 
        })

    } catch (err: any) {
        console.error("Test email error:", err)
        res.status(500).json({ 
            message: "Failed to send test email", error: err.message 
        })
    }
};
