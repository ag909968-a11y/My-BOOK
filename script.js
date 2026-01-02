let pdfDoc = null;
let pageNum = parseInt(localStorage.getItem("lastPage")) || 1;
let canvas = document.getElementById("pdfCanvas");
let ctx = canvas.getContext("2d");

document.getElementById("pdfInput").addEventListener("change", function (e) {
  const file = e.target.files[0];
  const reader = new FileReader();

  reader.onload = function () {
    pdfjsLib.getDocument(reader.result).promise.then(pdf => {
      pdfDoc = pdf;
      renderPage(pageNum);
    });
  };

  reader.readAsArrayBuffer(file);
});

function renderPage(num) {
  pdfDoc.getPage(num).then(page => {
    let viewport = page.getViewport({ scale: 1.3 });
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    page.render({ canvasContext: ctx, viewport: viewport });

    localStorage.setItem("lastPage", num);
    document.getElementById("status").innerText =
      `Page ${num} of ${pdfDoc.numPages}`;
  });
}

function nextPage() {
  if (pageNum < pdfDoc.numPages) {
    pageNum++;
    renderPage(pageNum);
  }
}

function prevPage() {
  if (pageNum > 1) {
    pageNum--;
    renderPage(pageNum);
  }
}
