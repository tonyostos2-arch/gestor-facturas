import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

const PORT = process.env.PORT || 10000;

// 🔑 PEGA AQUÍ TU API KEY DE GOOGLE VISION
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
                            image: { content: image },
                            features: [{ type: "TEXT_DETECTION" }]
                        }
                    ]
                })
            }
        );
console.log(JSON.stringify(data, null, 2));
        const data = await response.json();

        const text =
            data.responses?.[0]?.fullTextAnnotation?.text || "";

        res.json({ text });

    } catch (err) {
        console.error(err);
        res.json({ text: "" });
    }
});

app.listen(PORT, () => {
    console.log("Servidor listo en puerto", PORT);
});