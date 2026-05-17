require('dotenv').config();

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fetch = require('node-fetch');
const FormData = require('form-data');

const app = express();

app.use(cors());

const upload = multer({
    storage: multer.memoryStorage()
});

app.post('/upload', upload.single('image'), async (req, res) => {

    try {

        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No image uploaded'
            });
        }

        const form = new FormData();

        form.append('file', req.file.buffer, {
            filename: req.file.originalname
        });

        form.append('language', 'spa');
        form.append('isOverlayRequired', 'false');

        const response = await fetch(
            'https://api.ocr.space/parse/image',
            {
                method: 'POST',
                headers: {
                    apikey: process.env.OCR_API_KEY
                },
                body: form
            }
        );

        const data = await response.json();

        if (!data.ParsedResults || !data.ParsedResults[0]) {
            return res.json({
                success: false,
                error: 'OCR failed'
            });
        }

        const text = data.ParsedResults[0].ParsedText || '';

        console.log(text);

        return res.json({
            success: true,
            texto: text
        });

    } catch (err) {

        console.error(err);

        return res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});