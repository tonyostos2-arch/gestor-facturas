import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: "10mb" }));

const PORT = process.env.PORT || 10000;

// 🔑 TU API KEY DE GOOGLE VISION
const GOOGLE_API_KEY = "AIzaSyD2jDW12zlUeVf21XxK9lwTzMx4H7T5f94";

app.post("/ocr", async (req, res) => {
    try {

        const { image } = req.body;

        const response = await fetch(
            `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_API_KEY}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    requests: [
                        {
                            image: {
                                content: image
                            },
                            features: [
                                { type: "TEXT_DETECTION" }
                            ]
                        }
                    ]
                })
            }
        );

        const data = await response.json();

        const text =
            data.responses?.[0]?.fullTextAnnotation?.text || "";

        res.json({ text });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "OCR failed" });
    }
});

app.listen(PORT, () => {
    console.log("Server running on port", PORT);
});