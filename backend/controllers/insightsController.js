import { ai } from "../config/gemini.js";
import { buildInsightsRequest } from "../utils/prompt.js";

/**
 * A robust function to extract a JSON string from a larger text block.
 * It handles cases where the JSON is wrapped in markdown backticks.
 * @param {string} text - The raw text response from the LLM.
 * @returns {string} The cleaned, parsable JSON string.
 */
const extractJson = (text) => {
  // Find the first occurrence of '{'
  const startIndex = text.indexOf('{');
  // Find the last occurrence of '}'
  const endIndex = text.lastIndexOf('}');

  if (startIndex === -1 || endIndex === -1) {
    throw new Error("No valid JSON object found in the AI response.");
  }

  // Extract the substring from the first '{' to the last '}'
  return text.substring(startIndex, endIndex + 1);
};


export const generateInsights = async (req, res) => {
    console.log("Insights controller called (with JSON extractor)");
    
    const { chartContext, dataSummary } = req.body;

    if (!dataSummary || !dataSummary.columns || !dataSummary.previewRows) {
        return res.status(400).json({
            success: false,
            message: "Invalid request: dataSummary with columns and previewRows is required."
        });
    }

    try {
        const generationRequest = buildInsightsRequest(dataSummary, chartContext);
        console.log("Generated Request for Gemini:", JSON.stringify(generationRequest, null, 2));

        const result = await ai.models.generateContent(generationRequest);
        const responseText = result.text;
        console.log("Raw Response from Gemini:", responseText);

        // --- THE FIX IS HERE ---
        // 1. Clean the raw text to get only the JSON part.
        const jsonString = extractJson(responseText);
        
        // 2. Now parse the cleaned string. This is much safer.
        const jsonResponse = JSON.parse(jsonString);
        // --- END OF FIX ---

        res.status(200).json({
            success: true,
            insights: jsonResponse
        });

    } catch (error) {
        console.error("GEMINI API Error Details: ", error);
        let errorMessage = "Failed to generate insights from AI model.";
        if (error instanceof SyntaxError) {
            errorMessage = "AI model returned a malformed JSON structure that could not be parsed.";
        } else if (error.message.includes("No valid JSON object found")) {
            errorMessage = "The AI response did not contain a recognizable JSON object.";
        }
        
        res.status(500).json({
            success: false,
            message: errorMessage
        });
    }
};