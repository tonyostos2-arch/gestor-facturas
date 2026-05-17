const fileInput = document.getElementById('invoice-file');

const statusDiv = document.getElementById('status');

const numberInput = document.getElementById('invoice-number');

const clientInput = document.getElementById('invoice-client');

const providerInput = document.getElementById('invoice-provider');

const amountInput = document.getElementById('invoice-amount');

fileInput.addEventListener('change', async (e) => {

    const file = e.target.files[0];

    if (!file) return;

    statusDiv.innerText = 'Procesando imagen...';

    const formData = new FormData();

    formData.append('image', file);

    try {

        const response = await fetch(
            'https://gestor-facturas-jqbj.onrender.com/upload',
            {
                method: 'POST',
                body: formData
            }
        );

        const data = await response.json();

        console.log(data);

        if (!data.success) {

            statusDiv.innerText = 'OCR falló';

            return;
        }

        statusDiv.innerText = 'Factura procesada';

        const texto = data.texto;

        extraerDatos(texto);

    } catch (err) {

        console.error(err);

        statusDiv.innerText = 'Error conexión servidor';
    }
});

function extraerDatos(texto) {

    const textoMayus = texto.toUpperCase();

    let cliente = '';

    let proveedor = '';

    let monto = '';

    let numeroFactura = '';

    const facturaMatch = texto.match(
        /FACTURA\\s*(?:NO|NRO|NUMERO|#)?[:\\s-]*([A-Z0-9-]+)/i
    );

    if (facturaMatch) {
        numeroFactura = facturaMatch[1];
    }

    if (textoMayus.includes('MIRACLE')) {

        proveedor = 'LABORATORIO OPTICO MIRACLE SAS';

        const clienteMatch = texto.match(/CLIENTE[:\\s]+(.+)/i);

        if (clienteMatch) {
            cliente = clienteMatch[1];
        }

        const montoMatch = texto.match(
            /TOTAL A PAGAR[^\\d]*([\\d.,]+)/i
        );

        if (montoMatch) {
            monto = montoMatch[1];
        }
    }

    if (textoMayus.includes('BORA')) {

        proveedor = 'BORA LENS SAS';

        const clienteMatch = texto.match(
            /ADQUIRIENTE[:\\s]+(.+)/i
        );

        if (clienteMatch) {
            cliente = clienteMatch[1];
        }

        const montoMatch = texto.match(
            /TOTAL[^\\d]*([\\d.,]+)/i
        );

        if (montoMatch) {
            monto = montoMatch[1];
        }
    }

    numberInput.value = numeroFactura;

    clientInput.value = cliente;

    providerInput.value = proveedor;

    amountInput.value = monto;
}