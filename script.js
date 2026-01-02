const pdfjsLib = window['pdfjs-dist/build/pdf'];
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

let pdfDoc = null, 
    pageNum = 1, 
    currentBookUrl = "", 
    canvas = document.getElementById('pdf-canvas'), 
    ctx = canvas.getContext('2d');

// 1. OPEN THE BOOK
async function loadPDF(url) {
    currentBookUrl = url;
    
    // UI Switch: Hide Library, Show Reader
    document.getElementById('library-grid').style.display = 'none';
    document.getElementById('library-header').style.display = 'none';
    document.getElementById('reader-view').style.display = 'block';

    const loadingTask = pdfjsLib.getDocument(url);
    pdfDoc = await loadingTask.promise;
    document.getElementById('page-count').textContent = pdfDoc.numPages;

    // Load saved progress for this specific book
    const savedPage = localStorage.getItem('progress_' + url);
    pageNum = savedPage ? parseInt(savedPage) : 1;
    
    renderPage(pageNum);
}

// 2. RENDER THE PAGE (Optimized for iPhone Retina screens)
async function renderPage(num) {
    const page = await pdfDoc.getPage(num);
    
    // Scale 2.0 makes text crisp on iPhone
    const viewport = page.getViewport({ scale: 2.0 });
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = { canvasContext: ctx, viewport: viewport };
    await page.render(renderContext).promise;

    document.getElementById('page-num').textContent = num;
    localStorage.setItem('progress_' + currentBookUrl, num);
    
    // Scroll to top when page changes
    window.scrollTo(0,0);
}

// 3. GO BACK TO LIBRARY
function showLibrary() {
    document.getElementById('library-grid').style.display = 'grid';
    document.getElementById('library-header').style.display = 'block';
    document.getElementById('reader-view').style.display = 'none';
}

// 4. SEARCH LOGIC
document.getElementById('search-bar').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const cards = document.querySelectorAll('.book-card');
    cards.forEach(card => {
        const title = card.textContent.toLowerCase();
        card.style.display = title.includes(term) ? "flex" : "none";
    });
});

// 5. BUTTON CONTROLS
document.getElementById('prev').onclick = () => { if (pageNum <= 1) return; pageNum--; renderPage(pageNum); };
document.getElementById('next').onclick = () => { if (pageNum >= pdfDoc.numPages) return; pageNum++; renderPage(pageNum); };
