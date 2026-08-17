// Inisialisasi Ikon Lucide
lucide.createIcons();

// Elements DOM
const themeToggleBtn = document.getElementById('theme-toggle');
const htmlEl = document.documentElement;

const ytInput = document.getElementById('yt-url-input');
const btnLoadYt = document.getElementById('btn-load-yt');
const ytPlayer = document.getElementById('yt-player');
const iframeContainer = document.getElementById('iframe-container');
const audioPlaceholder = document.getElementById('audio-placeholder');
const btnGoLive = document.getElementById('btn-go-live');
const modeButtons = document.querySelectorAll('.btn-mode');

// --- 1. Mode Tema (Dark/Light Sync) ---
themeToggleBtn.addEventListener('click', () => {
    const currentTheme = htmlEl.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    htmlEl.setAttribute('data-theme', newTheme);
});

// --- 2. Pemutar Stream YouTube & Parse ID ---
function extractYouTubeID(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|live\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : url;
}

btnLoadYt.addEventListener('click', () => {
    const inputVal = ytInput.value.trim();
    if (!inputVal) return;

    const videoId = extractYouTubeID(inputVal);
    // Muat embed YouTube dengan Autoplay & JS API
    ytPlayer.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1`;
});

// --- 3. Tombol "TEKAN LIVE" ---
btnGoLive.addEventListener('click', () => {
    // Memuat ulang iframe agar kembali ke posisi live paling depan
    const currentSrc = ytPlayer.src;
    if (currentSrc) {
        ytPlayer.src = currentSrc;
        btnGoLive.classList.add('active');
    }
});

// --- 4. Switcher Mode Stream (Video / Audio / Tutup) ---
modeButtons.forEach(button => {
    button.addEventListener('click', () => {
        modeButtons.forEach(b => b.classList.remove('active'));
        button.classList.add('active');

        const mode = button.getAttribute('data-mode');

        if (mode === 'video') {
            iframeContainer.style.display = 'block';
            audioPlaceholder.style.display = 'none';
            iframeContainer.style.height = '100%';
        } else if (mode === 'audio') {
            // Dalam mode audio, kita kecilkan/sembunyikan tampilan visual video tapi audio tetap berjalan
            iframeContainer.style.display = 'none';
            audioPlaceholder.style.display = 'flex';
        } else if (mode === 'off') {
            iframeContainer.style.display = 'none';
            audioPlaceholder.style.display = 'none';
        }
    });
});

// --- 5. Logika PDF.js ---
const pdfInput = document.getElementById('pdf-file-input');
const pdfCanvas = document.getElementById('pdf-render-canvas');
const emptyState = document.getElementById('pdf-empty-state');
const pageNumInput = document.getElementById('page-num');
const pageCountEl = document.getElementById('page-count');
const zoomLevelEl = document.getElementById('zoom-level');

let pdfDoc = null;
let pageNum = 1;
let scale = 1.2;
const ctx = pdfCanvas.getContext('2d');

pdfInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
        const fileReader = new FileReader();
        fileReader.onload = function() {
            const typedarray = new Uint8Array(this.result);
            pdfjsLib.getDocument(typedarray).promise.then((pdf) => {
                pdfDoc = pdf;
                pageCountEl.textContent = pdf.numPages;
                pageNum = 1;
                emptyState.style.display = 'none';
                pdfCanvas.style.display = 'block';
                renderPage(pageNum);
            });
        };
        fileReader.readAsArrayBuffer(file);
    }
});

function renderPage(num) {
    if (!pdfDoc) return;
    pdfDoc.getPage(num).then((page) => {
        const viewport = page.getViewport({ scale: scale });
        pdfCanvas.height = viewport.height;
        pdfCanvas.width = viewport.width;

        const renderContext = {
            canvasContext: ctx,
            viewport: viewport
        };
        page.render(renderContext);
        pageNumInput.value = num;
    });
}

document.getElementById('prev-page').addEventListener('click', () => {
    if (pageNum <= 1) return;
    pageNum--;
    renderPage(pageNum);
});

document.getElementById('next-page').addEventListener('click', () => {
    if (!pdfDoc || pageNum >= pdfDoc.numPages) return;
    pageNum++;
    renderPage(pageNum);
});

document.getElementById('zoom-in').addEventListener('click', () => {
    scale += 0.15;
    zoomLevelEl.textContent = `${Math.round(scale * 100)}%`;
    renderPage(pageNum);
});

document.getElementById('zoom-out').addEventListener('click', () => {
    if (scale <= 0.5) return;
    scale -= 0.15;
    zoomLevelEl.textContent = `${Math.round(scale * 100)}%`;
    renderPage(pageNum);
});
