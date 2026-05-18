document.addEventListener('DOMContentLoaded', () => {

    const fileInput = document.getElementById('invoice-file');
    const statusDiv = document.getElementById('status');
    const clientInput = document.getElementById('invoice-client');
    const providerInput = document.getElementById('invoice-provider');
    const amountInput = document.getElementById('invoice-amount');

    fileInput.addEventListener('change', async (e) => {

        const file = e.target.files[0];
        if (!file) return;

        statusDiv.innerText = "Leyendo imagen...";

        try {

            const imageURL = URL.createObjectURL(file);

            const worker = await Tesseract.createWorker("spa");

            const result = await worker.recognize(imageURL);

            const text = result.data.text;

            console.log(text);

            statusDiv.innerText = "Texto extraído correctamente";

            procesarTexto(text);

            await worker.terminate();

        } catch (err) {
            console.error(err);
            statusDiv.innerText = "Error leyendo imagen";
        }
    });

    function procesarTexto(text) {

        let cliente = "";
        let proveedor = "";
        let monto = "";
        let numero = "";

        const t = text.toUpperCase();

        const f = t.match(/FACTURA\s*#?\s*([A-Z0-9-]+)/);
        if (f) numero = f[1];

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