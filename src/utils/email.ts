import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";


export const sendEmail = async (to: string, subject: string, text: string) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 587,
            seccure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        } as SMTPTransport.Options) 

        await transporter.sendMail({
            from: `"Event System" <${process.env.SMTP_USER}>`,
            to,
            subject,
            text
        })
        
        console.log(`Email sent to ${to} with subject "${subject}"`)

    } catch(err: any) {
        console.error("Failed to send email:", err.message)
        throw new Error("Email could not be sent")
    }
}