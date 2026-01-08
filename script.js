const uploadArea = document.getElementById('uploadArea');
const pdfInput = document.getElementById('pdfInput');
const outputText = document.getElementById('outputText');
const downloadBtn = document.getElementById('downloadBtn');
const clearBtn = document.getElementById('clearBtn');
const pageCountEl = document.getElementById('pageCount');
const statusEl = document.getElementById('status');
const progressBar = document.getElementById('progressBar');

uploadArea.addEventListener('click', () => pdfInput.click());

uploadArea.addEventListener('dragover', e => {
    e.preventDefault();
    uploadArea.style.background = 'rgba(56,189,248,0.15)';
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.style.background = '';
});

uploadArea.addEventListener('drop', e => {
    e.preventDefault();
    uploadArea.style.background = '';
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
        processPDF(file);
    }
});

pdfInput.addEventListener('change', () => {
    const file = pdfInput.files[0];
    if (file) {
        processPDF(file);
    }
});

clearBtn.addEventListener('click', () => {
    outputText.value = '';
    pageCountEl.innerText = 'Páginas: 0';
    statusEl.innerText = 'Status: aguardando arquivo...';
    progressBar.style.width = '0%';
    downloadBtn.disabled = true;
});

downloadBtn.addEventListener('click', () => {
    const blob = new Blob([outputText.value], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'texto_extraido.txt';
    link.click();
});

async function processPDF(file) {
    statusEl.innerText = 'Status: lendo PDF...';
    outputText.value = '';
    progressBar.style.width = '0%';
    downloadBtn.disabled = true;

    const fileReader = new FileReader();

    fileReader.onload = async function () {
        const typedArray = new Uint8Array(this.result);

        const pdf = await pdfjsLib.getDocument(typedArray).promise;
        const totalPages = pdf.numPages;
        pageCountEl.innerText = `Páginas: ${totalPages}`;

        let finalText = '';

        for (let i = 1; i <= totalPages; i++) {
            statusEl.innerText = `Status: processando página ${i} de ${totalPages}...`;
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();

            const pageText = textContent.items.map(item => item.str).join(' ');
            finalText += `\n\n=== Página ${i} ===\n` + pageText;

            const progress = Math.round((i / totalPages) * 100);
            progressBar.style.width = progress + '%';
        }

        outputText.value = finalText.trim();
        statusEl.innerText = 'Status: concluído ✔️';
        downloadBtn.disabled = false;
    };

    fileReader.readAsArrayBuffer(file);
}
