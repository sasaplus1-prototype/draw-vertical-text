function getWellFormedHtml(html) {
  const doc = document.implementation.createHTMLDocument('');

  doc.write(html);
  doc.documentElement.setAttribute('xmlns', doc.documentElement.namespaceURI);

  return new XMLSerializer().serializeToString(doc);
}

function convertToSvg(html, params) {
  const { width, height } = params;

  return (
    `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">` +
      `<foreignObject x="0" y="0" width="${width}" height="${height}">${html}</foreignObject>` +
    `</svg>`
  );
}

function drawToCanvas(canvas, svg) {
  const data = new DOMParser().parseFromString(svg, 'text/html');

  const dataUrl = window.btoa(
    unescape(
      encodeURIComponent(
        new XMLSerializer().serializeToString(data.querySelector('svg'))
      )
    )
  );

  const url = `data:image/svg+xml;base64,${dataUrl}`;

  return new Promise(function(resolve, reject) {
    const image = new Image();

    image.onerror = function(err) {
      reject(err);
    };
    image.onload = function() {
      const context = canvas.getContext('2d');

      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0);

      URL.revokeObjectURL(url);

      resolve();
    };
    image.src = url;
  });
}

async function main() {
  function update() {
    preview.innerHTML = textarea.value.replace(/\n/g, '<br>');
    preview.style.writingMode = 'vertical-rl';
    preview.style.lineHeight = '1';

    const html = getWellFormedHtml(preview.outerHTML);
    const rect = preview.getBoundingClientRect();
    const svg = convertToSvg(html, { width: rect.width, height: rect.height });

    svgArea.innerHTML = svg;

    const p = svgArea.querySelector('#preview');
    p.id = "";

    canvas.width = rect.width * 1.5;
    canvas.height = rect.height * 1.5;

    drawToCanvas(canvas, svg);
  }

  textarea.addEventListener('input', update, false);
}
main();
