import { Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { text } from "stream/consumers";


// initialize google genearive AI with api key
const apiKey = process.env.GEMINI_API_KEY!
const genAI = new GoogleGenerativeAI(apiKey)

export const eventConsultantAI = async (req: Request, res: Response) => {
  try {

    const { eventType, eventName, question } = req.body

    if (!eventType || !question) {
      return res.status(400).json({
        message: "Event type and question are required"
      })
    }

    // get gemini pro model
    const model = genAI.getGenerativeModel({ model: "gemini-pro"})

    const prompt = `You are an expert event planner assistent. Provide helpful, concise, and practical advice.
    
      ${eventName ? `Event Context: "${eventName}" (Type: ${eventType})` : `Event Type: ${eventType}`}
      
        User Question: "${question}"
        
        Provide a helpful response with:
        1. Clear, actionable advice
      2. If budgeting is mentioned, provide estimated ranges
      3. If timeline is mentioned, suggest key milestones
      4. If vendors are mentioned, suggest types of vendors needed
      5. Keep it practical and event-specific
      
      Format your response in a friendly, conversational tone.`

      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
  }
}