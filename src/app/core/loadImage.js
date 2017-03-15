export default function loadImage(src) {
    return new Promise((resolve) => {
        var img = new Image();
        img.onload = () => {
            resolve(img);
        };
        img.src = src;
    })
}
