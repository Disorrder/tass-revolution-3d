export default function downloadFile(data, filename = 'data.json', type) {
    if (!data) return;

    var blob = new Blob([data], {type});
    var url  = URL.createObjectURL(blob);

    var a = document.createElement('a');
    a.download    = filename;
    a.href        = url;
    a.textContent = `Download ${a.download}`;

    a.click();
}
