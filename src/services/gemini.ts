import { GoogleGenAI, Type } from "@google/genai";
import { InvoiceData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const invoiceSchema = {
  type: Type.OBJECT,
  properties: {
    invoiceNumber: { type: Type.STRING, description: "The invoice number or ID" },
    date: { type: Type.STRING, description: "The date of the invoice in YYYY-MM-DD format" },
    vendorName: { type: Type.STRING, description: "The name of the company or person who issued the invoice" },
    category: { type: Type.STRING, description: "A category for the expense (e.g., Food, Travel, Utilities, Software, Office Supplies)" },
    subtotal: { type: Type.NUMBER, description: "The subtotal amount before tax" },
    tax: { type: Type.NUMBER, description: "The total tax amount" },
    totalAmount: { type: Type.NUMBER, description: "The final total amount including tax" },
    currency: { type: Type.STRING, description: "The currency code (e.g., INR)" },
    itcStatus: { 
      type: Type.STRING, 
      description: "Whether Input Tax Credit (ITC) is 'eligible' or 'blocked' as per Section 17(5) of the CGST Act 2017 based on the nature of goods/services." 
    },
    itcReason: { 
      type: Type.STRING, 
      description: "A brief explanation of why the ITC is eligible or blocked, citing Section 17(5) rules where applicable." 
    },
    items: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          description: { type: Type.STRING },
          quantity: { type: Type.NUMBER },
          unitPrice: { type: Type.NUMBER },
          amount: { type: Type.NUMBER }
        },
        required: ["description", "amount"]
      }
    }
  },
  required: ["invoiceNumber", "date", "vendorName", "totalAmount"]
};

export async function extractInvoiceData(file: File): Promise<Partial<InvoiceData>> {
  const base64Data = await fileToBase64(file);
  const mimeType = file.type;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          inlineData: {
            data: base64Data.split(',')[1],
            mimeType: mimeType
          }
        },
        {
          text: "Extract all relevant data from this invoice. Identify the nature of goods or services. Use Google Search to verify the current rules of Section 17(5) of the CGST Act 2017 and determine if the Input Tax Credit (ITC) for this specific invoice is 'eligible' or 'blocked'. Examples of blocked ITC: motor vehicles (with exceptions), food and beverages, outdoor catering, beauty treatment, health services, etc. Return the data in the specified JSON format."
        }
      ],
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: invoiceSchema
      }
    });

    const text = response.text;
    console.log("Gemini Raw Response:", text);
    
    if (!text) throw new Error("Empty response from Gemini API");
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Error extracting invoice data:", error);
    throw error;
  }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}
