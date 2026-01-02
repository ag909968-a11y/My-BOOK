const pdfjsLib = window['pdfjs-dist/build/pdf'];
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

let pdfDoc = null, 
    pageNum = 1, 
    currentBookUrl = "", 
    canvas = document.getElementById('pdf-canvas'), 
    ctx = canvas.getContext('2d');

async function loadPDF(url) {
    currentBookUrl = url;
    const loadingTask = pdfjsLib.getDocument(url);
    
    try {
        pdfDoc = await loadingTask.promise;
        document.getElementById('page-count').textContent = pdfDoc.numPages;

        // Progress Tracking: Get progress specific to THIS book
        const savedPage = localStorage.getItem('progress_' + url);
        pageNum = savedPage ? parseInt(savedPage) : 1;
        
        renderPage(pageNum);
    } catch (error) {
        alert("Error loading book. Make sure the filename matches exactly!");
    }
}

async function renderPage(num) {
    const page = await pdfDoc.getPage(num);
    const viewport = page.getViewport({ scale: 1.5 });
    
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = { canvasContext: ctx, viewport: viewport };
    await page.render(renderContext).promise;

    document.getElementById('page-num').textContent = num;
    
    // Save progress for this specific book
    localStorage.setItem('progress_' + currentBookUrl, num);
}

// Event Listeners
document.getElementById('book-selector').onchange = (e) => {
    if (e.target.value) loadPDF(e.target.value);
};

document.getElementById('prev').onclick = () => {
    if (pageNum <= 1) return;
    pageNum--;
    renderPage(pageNum);
};

document.getElementById('next').onclick = () => {
    if (pageNum >= pdfDoc.numPages) return;
    pageNum++;
    renderPage(pageNum);
};