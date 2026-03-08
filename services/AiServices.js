// services/AiServices.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateHalalItinerary = async (location, days, lat, lng) => {
  try {
    // Menggunakan nama model yang lebih spesifik jika 'gemini-1.5-flash' error
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
    });

    const prompt = `
      You are a specialized Halal Travel Assistant. 
      Generate a ${days}-day travel plan for ${location}.
      The user is currently at GPS coordinates: ${lat}, ${lng}.

      REQUIREMENTS:
      1. Prioritize Halal-certified restaurants or Muslim-owned eateries.
      2. Include nearby Mosques or Prayer Rooms for each day.
      3. Focus on popular tourism spots in ${location}.

      OUTPUT FORMAT (Strict JSON):
      Return an array of objects representing days:
      [
        {
          "day": 1,
          "date": "2026-03-20", 
          "plans": [
            {
              "id": "id_${Date.now()}",
              "type": "Hotel/Food/Tourism",
              "name": "Name of Place",
              "time": "HH:mm",
              "rating": 4.5,
              "distance": "description",
              "category": "category",
              "halalStatus": "Certified/Muslim Owned",
              "iconType": "hotel/food/tourism"
            }
          ]
        }
      ]
    `;

    // Gunakan konfigurasi terbaru
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const response = await result.response;
    const text = response.text();

    return JSON.parse(text);
  } catch (error) {
    console.error("--- Gemini API Detail Error ---");
    console.error("Message:", error.message);

    // Jika masih 404, tandanya API Key kamu mungkin terikat ke region
    // yang belum mendukung model Flash 1.5, atau library belum terupdate.
    if (error.message.includes("404")) {
      throw new Error(
        "Model Gemini 1.5 Flash tidak ditemukan. Pastikan sudah menjalankan 'npm install @google/generative-ai@latest' dan API Key sudah benar.",
      );
    }

    throw new Error("Gagal menggenerasi itinerary: " + error.message);
  }
};

module.exports = { generateHalalItinerary };
