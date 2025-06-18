export const buildInsightsRequest = (dataSummary, chartContext) => {
  // Basic validation
  if (!dataSummary || !dataSummary.columns) {
    throw new Error("Cannot build prompt: dataSummary with columns is required.");
  }

  // Part 1: The System Instruction - The model's persona and high-level goal.
  const systemInstruction = `You are an expert data analyst. Your goal is to analyze the provided data context and return structured insights as a valid JSON object. Do not include any markdown, code block formatting, or explanatory text outside of the JSON structure.`;

  // Part 2: The User Prompt - The specific data and task for this request.
  const userPrompt = `
    Here is the context of the user's data:
    - Sheet Name: "${dataSummary.sheetName || 'N/A'}"
    - Columns: ${JSON.stringify(dataSummary.columns)}
    - Total Rows of Data: ${dataSummary.rowCount || 'Unknown'}
    - Data Preview (first few rows): ${JSON.stringify(dataSummary.previewRows)}

    ${chartContext ? `
    The user has also generated a ${chartContext.type} chart with:
    - X-Axis: "${chartContext.xAxis}"
    - Y-Axis: "${chartContext.yAxis}"
    ` : ''}

    Based on this context, please provide the following insights.
    The JSON object must have these keys: "summary", "keyStats", "trends", "anomalies", "recommendations".
    - summary: A brief, one-sentence overview of the dataset.
    - keyStats: An array of 3-4 key statistics. Each item should be a string with an appropriate emoji.
    - trends: An array of 1-2 significant trends you observe in the data.
    - anomalies: An array of any surprising outliers or potential data errors. If none, return an empty array.
    - recommendations: An array of 1-2 actionable suggestions for the user.
  `;

  // Part 3: Construct the final request object
  return {
    model: "gemini-1.5-flash", // Use 1.5-flash for speed and cost-effectiveness
    contents: userPrompt,
    // Configuration to ensure the model behaves correctly
    generationConfig: {
      responseMimeType: "application/json", // This is the key for reliable JSON output!
      temperature: 0.2, // Lower temperature for more deterministic, structured output
    },
    systemInstruction: {
        parts: [{ text: systemInstruction }]
    }
  };
};