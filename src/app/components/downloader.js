export default function downloadJSON(data, filename = 'data.json') {
    if (!data) return;

    var json = JSON.stringify(data);
    console.log('exp json', json);
    var blob = new Blob([json], {type: "application/json"});
    var url  = URL.createObjectURL(blob);

    var a = document.createElement('a');
    a.download    = filename;
    a.href        = url;
    a.textContent = `Download ${a.download}`;

    a.click();
}
