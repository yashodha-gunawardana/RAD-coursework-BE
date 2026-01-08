import { Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";


// initialize google genearive AI with api key
const apiKey = process.env.GEMINI_API_KEY!
const genAI = new GoogleGenerativeAI(apiKey)

export const eventConsultantAI = async (req: Request, res: Response) => {
  try {

    const { eventType, eventName, question } = req.body
  }
}