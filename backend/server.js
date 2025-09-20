const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const cors = require('cors');
const fs = require('fs'); // File System module to read JSON files

dotenv.config();

const app = express();
app.use(express.json()); // Middleware to parse JSON bodies
app.use(cors()); // Enable CORS for all routes

// --- LOAD YOUR GROUNDING DATA ---
const pricingData = JSON.parse(fs.readFileSync('pricing_by_city.json', 'utf-8'));
const materialData = JSON.parse(fs.readFileSync('raw_material_sources.json', 'utf-8'));

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

// --- DEFINE THE API ENDPOINT ---
app.post('/analyze-product', async (req, res) => {
    try {
        const { productName, productCategory, rawMaterialCost, sellingPrice } = req.body;

        // This is the "Grounded Intelligence" part
        const context = `
            Market Pricing Data: ${JSON.stringify(pricingData)}
            Raw Material Suppliers Data: ${JSON.stringify(materialData)}
        `;

        // This is the "Prompt Engineering" part
        const prompt = `
            You are an expert business analyst for Indian artisans. Your tone is encouraging and helpful. Your output must be in Markdown format.
            Analyze the following artisan's product based on the provided context.

            **Artisan's Product Information:**
            - Product Name: ${productName}
            - Product Category: ${productCategory}
            - Raw Material Cost per item (INR): ${rawMaterialCost}
            - Current Selling Price (INR): ${sellingPrice}

            **Contextual Data (Use this for your analysis):**
            ${context}

            **Your Task (Provide a response in 3 sections):**

            **1. Business Analysis:**
            - Calculate the current profit per product in INR.
            - Calculate the current profit margin percentage.
            - Based on the contextual data, state if they are making a good profit or if there's room for improvement.
            - Suggest a new, optimized selling price and explain why.

            **2. Market Expansion:**
            - Identify the top 2 cities from the data where this product could be sold for a better profit. Mention the potential price and demand in those cities.

            **3. Marketing Strategy (Be very specific and actionable):**
            - Create a compelling WhatsApp post text to sell this product.
            - Suggest an engaging Instagram caption with 3-4 relevant hashtags.
            - Recommend the best time of day to post on Instagram for maximum reach in India.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.json({ analysis: text });

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        res.status(500).json({ error: "Failed to get analysis from AI." });
    }
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});