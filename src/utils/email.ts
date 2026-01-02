import nodemailer from "nodemailer";

export const sendEmail = async (to: string, subject: string, text: string) => {
    try {
        const transporter = nodemailer.createTransport({
            hos: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            seccure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        })
    } catch(err) {

    }
}