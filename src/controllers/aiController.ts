import { Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const eventConsultantAI = async (req: Request, res: Response) => {
  try {
    const { eventType, eventName } = req.body;

    if (!eventType || !eventName) {
      return res.status(400).json({
        message: "eventType and eventName are required",
      });
    }

    // initialize Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // AI Prompt 
    const prompt = `
You are a professional event planning consultant.

Event Type: ${eventType}
Event Name: ${eventName}

Provide:
1. Estimated budget in LKR
2. Recommended guest capacity
3. Simple event timeline (3 steps)
4. Short event description

Respond in JSON format only.
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    return res.status(200).json({
      success: true,
      aiResponse: responseText,
    });
  } catch (error) {
    return res.status(500).json({
      message: "AI Event Consultant failed",
      error,
    });
  }
};
