document.addEventListener('DOMContentLoaded', () => {

    const fileInput = document.getElementById('invoice-file');
    const statusDiv = document.getElementById('status');
    const clientInput = document.getElementById('invoice-client');
    const providerInput = document.getElementById('invoice-provider');
    const amountInput = document.getElementById('invoice-amount');

    fileInput.addEventListener('change', async (e) => {

        const file = e.target.files[0];
        if (!file) return;

        statusDiv.innerText = "Procesando factura...";

        try {

            // convertir a base64
            const toBase64 = (file) =>
                new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = () => resolve(reader.result.split(',')[1]);
                    reader.onerror = reject;
                });

            const base64 = await toBase64(file);

            // enviar a Render
            const response = await fetch(
                "https://gestor-facturas-jqbj.onrender.com/ocr",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ image: base64 })
                }
            );

            const data = await response.json();

            console.log("RESPUESTA BACKEND:", data);

            if (!data.text) {
                statusDiv.innerText = "No se detectó texto";
                return;
            }

            statusDiv.innerText = "Factura leída";

            procesarTexto(data.text);

        } catch (err) {
            console.error(err);
            statusDiv.innerText = "Error OCR";
        }
    });

    function procesarTexto(text) {

        let cliente = "";
        let proveedor = "";
        let monto = "";

        const t = text.toUpperCase();

        const c = text.match(/CLIENTE[:\s]+(.*)/i);
        if (c) cliente = c[1];

        const p = text.match(/(PROVEEDOR|EMISOR)[:\s]+(.*)/i);
        if (p) proveedor = p[2];

        const m = t.match(/TOTAL[^0-9]*([\d.,]+)/i);
        if (m) monto = m[1];

        clientInput.value = cliente;
        providerInput.value = proveedor;
        amountInput.value = monto;
    }

});