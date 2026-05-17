document.addEventListener('DOMContentLoaded', () => {

    const fileInput = document.getElementById('invoice-file');
    const statusDiv = document.getElementById('status');
    const clientInput = document.getElementById('invoice-client');
    const providerInput = document.getElementById('invoice-provider');
    const amountInput = document.getElementById('invoice-amount');
    const addInvoiceBtn = document.getElementById('add-invoice-btn');
    const filterClientSelect = document.getElementById('filter-client');
    const pendingList = document.getElementById('pending-list');
    const paidList = document.getElementById('paid-list');

    // ⚠️ PON AQUÍ TU API KEY REAL DE OCR.SPACE
    const apiKey = "K81593425388957";

    let clientes = JSON.parse(localStorage.getItem('auto_clientes')) || [];
    let facturas = JSON.parse(localStorage.getItem('auto_facturas')) || [];

    // =========================
    // 📸 CAPTURA DE IMAGEN
    // =========================
    fileInput.addEventListener('change', async (e) => {

        const file = e.target.files[0];
        if (!file) return;

        statusDiv.className = "status processing";
        statusDiv.innerText = "Procesando imagen con OCR...";

        try {

            const formData = new FormData();
            formData.append('file', file, file.name);
            formData.append('language', 'spa');
            formData.append('isOverlayRequired', 'false');

            const response = await fetch('https://api.ocr.space/parse/image', {
                method: 'POST',
                headers: {
                    'apikey': apiKey
                },
                body: formData
            });

            const data = await response.json();

            console.log("OCR RESPONSE:", data);

            if (data.IsErroredOnProcessing) {
                throw new Error(data.ErrorMessage || "Error en OCR");
            }

            if (data.ParsedResults && data.ParsedResults.length > 0) {

                const extractedText = data.ParsedResults[0].ParsedText;

                statusDiv.className = "status success";
                statusDiv.innerText = "Factura leída correctamente";

                procesarTextoFactura(extractedText);

            } else {
                throw new Error("No se detectó texto en la imagen");
            }

        } catch (err) {
            console.error(err);
            statusDiv.className = "status error";
            statusDiv.innerText = "OCR falló. Intenta otra foto más clara.";
        }
    });

    // =========================
    // 🧠 EXTRACCIÓN DE DATOS
    // =========================
    function procesarTextoFactura(text) {

        let cliente = "NO DETECTADO";
        let proveedor = "NO DETECTADO";
        let monto = "";
        let numeroFactura = "";

        const texto = text.toUpperCase();

        // 📌 Número de factura (nuevo requisito)
        const matchFactura = texto.match(/(FACTURA|INVOICE)\s*#?\s*([A-Z0-9-]+)/i);
        if (matchFactura) {
            numeroFactura = matchFactura[2];
        }

        // 📌 Cliente
        const matchCliente = texto.match(/CLIENTE[:\s]+(.*)/i);
        if (matchCliente) {
            cliente = matchCliente[1].split("\n")[0].trim();
        }

        // 📌 Proveedor
        const matchProveedor = texto.match(/(PROVEEDOR|EMISOR|FROM)[:\s]+(.*)/i);
        if (matchProveedor) {
            proveedor = matchProveedor[2].split("\n")[0].trim();
        }

        // 📌 Monto
        const matchMonto = texto.match(/TOTAL[^0-9]*([\d.,]+)/i);
        if (matchMonto) {
            monto = matchMonto[1].replace(/[^0-9.]/g, '');
        }

        // Mostrar en inputs
        clientInput.value = cliente;
        providerInput.value = proveedor;
        amountInput.value = monto;

        // (Opcional) si quieres mostrar número de factura en consola
        console.log("Factura:", numeroFactura);
    }

    // =========================
    // 💾 GUARDAR FACTURA
    // =========================
    addInvoiceBtn.addEventListener('click', () => {

        const nombreCliente = clientInput.value.trim();
        const proveedor = providerInput.value.trim();
        const monto = amountInput.value.trim();

        if (!nombreCliente || !proveedor || !monto) {
            return alert("Completa todos los campos");
        }

        let clienteExistente = clientes.find(c =>
            c.nombre.toLowerCase() === nombreCliente.toLowerCase()
        );

        if (!clienteExistente) {
            clienteExistente = {
                id: 'cli_' + Date.now(),
                nombre: nombreCliente
            };
            clientes.push(clienteExistente);
        }

        facturas.push({
            id: 'fac_' + Date.now(),
            clienteId: clienteExistente.id,
            proveedor,
            monto,
            pagada: false
        });

        guardarYActualizar();

        clientInput.value = "";
        providerInput.value = "";
        amountInput.value = "";
    });

    // =========================
    // 🔄 HELPERS
    // =========================
    window.cambiarEstadoFactura = (id) => {
        facturas = facturas.map(f =>
            f.id === id ? { ...f, pagada: !f.pagada } : f
        );
        guardarYActualizar();
    };

    window.eliminarFactura = (id) => {
        facturas = facturas.filter(f => f.id !== id);
        guardarYActualizar();
    };

    function guardarYActualizar() {

        localStorage.setItem('auto_clientes', JSON.stringify(clientes));
        localStorage.setItem('auto_facturas', JSON.stringify(facturas));

        filterClientSelect.innerHTML = '<option value="todos">Todos los clientes</option>';

        clientes.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.id;
            opt.textContent = c.nombre;
            filterClientSelect.appendChild(opt);
        });

        actualizarListasFacturas();
    }

    function actualizarListasFacturas() {

        pendingList.innerHTML = '';
        paidList.innerHTML = '';

        const filtro = filterClientSelect.value;

        facturas
            .filter(f => filtro === 'todos' || f.clienteId === filtro)
            .forEach(f => {

                const cliente = clientes.find(c => c.id === f.clienteId);

                const li = document.createElement('li');
                li.className = `invoice-item ${f.pagada ? 'paid-item' : 'pending-item'}`;

                li.innerHTML = `
                    <div class="invoice-info">
                        <span>👤 ${cliente ? cliente.nombre : 'Desconocido'}</span>
                        <span><strong>${f.proveedor}</strong></span>
                        <span>$ ${f.monto}</span>
                    </div>
                    <div class="invoice-actions">
                        <button onclick="cambiarEstadoFactura('${f.id}')">
                            ${f.pagada ? 'Reabrir' : 'Pagar'}
                        </button>
                        <button onclick="eliminarFactura('${f.id}')">❌</button>
                    </div>
                `;

                if (f.pagada) paidList.appendChild(li);
                else pendingList.appendChild(li);
            });
    }

    filterClientSelect.addEventListener('change', actualizarListasFacturas);

    guardarYActualizar();
});