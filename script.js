// PDF.js Worker Configuration
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

let pdfDoc = null,
    pageNum = 1,
    pageRendering = false,
    pageNumPending = null,
    scale = 1.2,
    canvas = document.getElementById('pdf-render-canvas'),
    ctx = canvas.getContext('2d');

// Inisialisasi Ikon Lucide
lucide.createIcons();

// Fitur Pengubah Tema (Dark/Light Mode)
const themeToggleBtn = document.getElementById('theme-toggle');
themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    themeToggleBtn.innerHTML = newTheme === 'dark' ? '<i data-lucide="sun"></i>' : '<i data-lucide="moon"></i>';
    lucide.createIcons();
});

// Render Halaman PDF
function renderPage(num) {
    pageRendering = true;
    pdfDoc.getPage(num).then((page) => {
        const viewport = page.getViewport({ scale: scale });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
            canvasContext: ctx,
            viewport: viewport
        };
        const renderTask = page.render(renderContext);

        renderTask.promise.then(() => {
            pageRendering = false;
            if (pageNumPending !== null) {
                renderPage(pageNumPending);
                pageNumPending = null;
            }
        });
    });

    document.getElementById('page-num').value = num;
}

function queueRenderPage(num) {
    if (pageRendering) {
        pageNumPending = num;
    } else {
        renderPage(num);
    }
}

// Navigasi Halaman PDF
document.getElementById('prev-page').addEventListener('click', () => {
    if (pageNum <= 1) return;
    pageNum--;
    queueRenderPage(pageNum);
});

document.getElementById('next-page').addEventListener('click', () => {
    if (pageNum >= pdfDoc.numPages) return;
    pageNum++;
    queueRenderPage(pageNum);
});

document.getElementById('page-num').addEventListener('change', (e) => {
    const desiredPage = parseInt(e.target.value);
    if (desiredPage >= 1 && desiredPage <= pdfDoc.numPages) {
        pageNum = desiredPage;
        queueRenderPage(pageNum);
    }
});

// Kontrol Zoom PDF
document.getElementById('zoom-in').addEventListener('click', () => {
    scale += 0.2;
    document.getElementById('zoom-level').textContent = `${Math.round(scale * 100)}%`;
    queueRenderPage(pageNum);
});

document.getElementById('zoom-out').addEventListener('click', () => {
    if (scale <= 0.6) return;
    scale -= 0.2;
    document.getElementById('zoom-level').textContent = `${Math.round(scale * 100)}%`;
    queueRenderPage(pageNum);
});

// Memuat File PDF Lokal
document.getElementById('pdf-file-input').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
        const fileReader = new FileReader();
        fileReader.onload = function() {
            const typedarray = new Uint8Array(this.result);
            pdfjsLib.getDocument(typedarray).promise.then((pdfDoc_) => {
                pdfDoc = pdfDoc_;
                document.getElementById('page-count').textContent = pdfDoc.numPages;
                pageNum = 1;
                renderPage(pageNum);
            });
        };
        fileReader.readAsArrayBuffer(file);
    }
});

// Memuat Link YouTube Live / Video ID
document.getElementById('btn-load-yt').addEventListener('click', () => {
    const input = document.getElementById('yt-url-input').value.trim();
    if (!input) return;
    
    let videoId = input;
    if (input.includes('youtube.com/watch?v=')) {
        videoId = input.split('v=')[1].split('&')[0];
    } else if (input.includes('youtu.be/')) {
        videoId = input.split('youtu.be/')[1].split('?')[0];
    } else if (input.includes('youtube.com/live/')) {
        videoId = input.split('youtube.com/live/')[1].split('?')[0];
    }

    const iframe = document.getElementById('yt-player');
    iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
});
