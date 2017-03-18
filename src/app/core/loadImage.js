export default function loadImage(src) {
    return new Promise((resolve) => {
        var img = new Image();
        img.onload = () => {
            resolve(img);
        };
        img.src = src;
    })
}

// --- requires babel-polyfill ---
// export async function loadImageSync(src) {
//     return await loadImage(src);
// }
