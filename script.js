pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

let pdfDoc = null;
let pageNum = 1;
let currentBook = '';
let canvas = document.getElementById('pdf-canvas');
let ctx = canvas.getContext('2d');

/* ---------- LIBRARY ---------- */
async function loadLibrary() {
    const res = await fetch('books/books.json');
    const books = await res.json();
    const grid = document.getElementById('library-grid');

    grid.innerHTML = '';

    books.forEach(book => {
        const card = document.createElement('div');
        card.className = 'book-card';
        card.textContent = book.title;
        card.onclick = () => openBook(book);
        grid.appendChild(card);
    });
}

function openBook(book) {
    currentBook = book.file;
    document.getElementById('book-title').textContent = book.title;

    document.getElementById('library-view').hidden = true;
    document.getElementById('reader-view').hidden = false;

    loadPDF(`books/${book.file}`);
}

/* ---------- PDF ---------- */
async function loadPDF(url) {
    pdfDoc = await pdfjsLib.getDocument(url).promise;

    const saved = localStorage.getItem('progress_' + currentBook);
    pageNum = saved ? parseInt(saved) : 1;

    document.getElementById('page-count').textContent = pdfDoc.numPages;
    renderPage(pageNum);
}

async function renderPage(num) {
    if (!pdfDoc) return;

    const page = await pdfDoc.getPage(num);
    const scale = window.devicePixelRatio > 2 ? 3 : 2.2;
    const viewport = page.getViewport({ scale });

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({ canvasContext: ctx, viewport }).promise;

    pageNum = num;
    document.getElementById('page-num').textContent = pageNum;

    const progress = (pageNum / pdfDoc.numPages) * 100;
    document.getElementById('progress-bar').style.width = progress + '%';

    localStorage.setItem('progress_' + currentBook, pageNum);
}

/* ---------- TAP ---------- */
document.getElementById('tap-right').addEventListener('pointerdown', () => {
    if (pageNum < pdfDoc.numPages) renderPage(pageNum + 1);
});

document.getElementById('tap-left').addEventListener('pointerdown', () => {
    if (pageNum > 1) renderPage(pageNum - 1);
});

/* ---------- SWIPE UP / DOWN ---------- */
let startY = 0;

document.addEventListener('touchstart', e => {
    if (!pdfDoc) return;
    startY = e.touches[0].clientY;
}, { passive: true });

document.addEventListener('touchend', e => {
    if (!pdfDoc) return;

    const endY = e.changedTouches[0].clientY;
    const deltaY = startY - endY;

    if (Math.abs(deltaY) < 60) return;

    if (deltaY > 0 && pageNum < pdfDoc.numPages) {
        renderPage(pageNum + 1);
    } else if (deltaY < 0 && pageNum > 1) {
        renderPage(pageNum - 1);
    }
}, { passive: true });

/* ---------- CONTROLS ---------- */
document.getElementById('back-btn').onclick = () => {
    document.getElementById('reader-view').hidden = true;
    document.getElementById('library-view').hidden = false;
};

document.getElementById('mode-btn').onclick = () => {
    document.body.classList.toggle('dark');
};

window.addEventListener('resize', () => {
    if (pdfDoc) renderPage(pageNum);
});

/* INIT */
loadLibrary();
