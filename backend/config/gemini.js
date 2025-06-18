import { GoogleGenAI } from "@google/genai"
import { config } from "dotenv";
config();

export const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API});
