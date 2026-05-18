import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

const PORT = process.env.PORT || 10000;

// 🔑 PEGA TU API KEY AQUÍ
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

        console.log("VISION RESPONSE:", JSON.stringify(data, null, 2));

        const text =
            data.responses?.[0]?.fullTextAnnotation?.text || "";

        res.json({ text });

    } catch (err) {
        console.error("ERROR BACKEND:", err);
        res.status(500).json({ text: "" });
    }
});

app.listen(PORT, () => {
    console.log("Servidor listo en puerto", PORT);
});