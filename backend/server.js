const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const cors = require('cors');
const fs = require('fs');
const multer = require('multer'); // For handling file uploads

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
// Serve images from the 'uploads' directory
app.use('/uploads', express.static('uploads'));

// --- MULTER SETUP for Image Uploads ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Store uploaded files in an 'uploads' folder
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); // Create a unique filename
    }
});
const upload = multer({ storage: storage });

// Create 'uploads' directory if it doesn't exist
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// --- Initialize Gemini ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// Use a model that supports multimodal input (image + text)
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

// Helper function to convert file to base64
function fileToGenerativePart(path, mimeType) {
    return {
        inlineData: {
            data: Buffer.from(fs.readFileSync(path)).toString("base64"),
            mimeType
        },
    };
}

// --- API ENDPOINTS ---

// GET endpoint to fetch all products for the customer view
app.get('/get-products', (req, res) => {
    try {
        const products = JSON.parse(fs.readFileSync('products.json', 'utf-8'));
        res.json(products);
    } catch (error) {
        console.error("Error reading products:", error);
        res.status(500).json({ error: "Failed to retrieve products." });
    }
});

// POST endpoint for an artisan to upload a new product
app.post('/upload-product', upload.single('productImage'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('No image uploaded.');
        }

        const price = req.body.price;
        const imagePath = req.file.path;
        const imageMimeType = req.file.mimetype;

        // Multimodal prompt: send both an image and text to Gemini
        const prompt = "Generate a compelling product name and a short, one-sentence marketing description for this artisan craft item. Format the response as a JSON object with keys 'name' and 'info'.";
        const imagePart = fileToGenerativePart(imagePath, imageMimeType);

        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        // Clean up the text response from Gemini to parse it as JSON
        const text = response.text().replace('```json', '').replace('```', '').trim();
        const generatedDetails = JSON.parse(text);

        const newProduct = {
            name: generatedDetails.name,
            price: parseInt(price), // Get price from form data
            info: generatedDetails.info,
            image: `/uploads/${req.file.filename}` // URL path to the saved image
        };
        
        // Save the new product to our JSON "database"
        const products = JSON.parse(fs.readFileSync('products.json', 'utf-8'));
        products.push(newProduct);
        fs.writeFileSync('products.json', JSON.stringify(products, null, 2));

        res.status(201).json(newProduct);

    } catch (error) {
        console.error("Error processing product upload:", error);
        res.status(500).json({ error: "Failed to create product." });
    }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});