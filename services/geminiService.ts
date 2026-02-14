
import { GoogleGenAI, Type } from "@google/genai";
import { ScanResult, BinCategory } from "../types";

export const geminiService = {
  classifyWaste: async (base64Image: string): Promise<ScanResult> => {
    // Corrected initialization: use named parameter and direct process.env.API_KEY access
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const imagePart = {
      inlineData: {
        mimeType: 'image/jpeg',
        data: base64Image.split(',')[1] || base64Image,
      },
    };

    // Refined for speed and added funFact
    const prompt = `Classify this waste object for disposal. 
    Output JSON: {
      "detectedItem": "item name",
      "binCategory": "waste" | "compost" | "recycle",
      "confidence": 0-1,
      "explanation": "brief reason",
      "disposalTips": ["tip 1", "tip 2"],
      "funFact": "one surprising environmental fact about this item"
    }`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts: [imagePart, { text: prompt }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            detectedItem: { type: Type.STRING },
            binCategory: { 
              type: Type.STRING, 
              enum: ['waste', 'compost', 'recycle'] 
            },
            confidence: { type: Type.NUMBER },
            explanation: { type: Type.STRING },
            disposalTips: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            },
            funFact: { type: Type.STRING },
          },
          required: ['detectedItem', 'binCategory', 'confidence', 'explanation', 'disposalTips', 'funFact']
        }
      }
    });

    try {
      // Corrected: response.text is a property, not a method
      const text = response.text;
      if (!text) throw new Error("Empty response from AI");
      return JSON.parse(text) as ScanResult;
    } catch (error) {
      console.error("Failed to parse AI response", error);
      throw new Error("AI classification failed. Ensure the image is clear.");
    }
  }
};
