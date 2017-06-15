export default class Controller {
    constructor() {
        // this.debug = true;
        this.scene = $('#scene')[0];
        this.photos = photoNames;
        this.photosElem = $('#photos');

        if (this.scene.hasLoaded) {
            this.onStart()
        } else {
            this.scene.addEventListener('loaded', this.onStart.bind(this));
        }

        window.exportScene = this.exportScene.bind(this);
        window.ctrl = this;

        // setInterval(() => {
        //     $('a-video, video').click();
        //     $('a-video, video').map((k, v) => {
        //         console.log(k, v.play, v);
        //         if (v.play) v.play();
        //     })
        // }, 500);
    }

    initGui() {

    }

    onStart() {
        this.initGui();

        if (AFRAME.utils.device.isGearVR()
            || AFRAME.utils.device.isMobile()
        ) {
            setTimeout(() => {
                $('.a-enter-vr-button').click();
            }, 1000);
        }
    }

    // --- camera GUI ---
    guiShow(selector, asset) {
        this.guiHide(selector).then(() => {
            $(selector).attr('src', asset);
            return animate.fadeIn(selector, {duration: 700}).finished;
        });
    }

    guiHide(selector) {
        return animate.fadeOut(selector).finished;
    }

    // -- exporter --
    exportScene(selector = '#scene') {
        var exporter = new THREE.OBJExporter();
        // var obj = this.scene;
        var obj = $(selector)[0].object3D;
        var data = exporter.parse(obj);
        // console.log(data);
        downloadFile(data, selector+'.obj');
    }

    // -- legacy code --
    addImage(src) {
        if (!src) src = this.photos[_.random(this.photos.length-1)]; //? test

        var pos = [
            _.random(-2, 2, true),
            _.random(1.5, 3, true),
            _.random(-5, 0, true)
        ];

        src = photoCtx(src);
        var image = $('<a-image>').attr({
            src: src,
            position: pos.join(' '),
        });

        loadImage(src).then((img) => {
            // console.log(img, image, img.width, img.height);
            var factor = img.width / img.height;
            var height = 2;
            image.attr({
                sizeFactor: factor,
                width: factor * height,
                height: height,
            }).appendTo('#photos');
            image[0].emit('fade-in zoom-in');
            return image;
        });

        var anim = [fadeIn, zoomIn];
        anim[_.random(anim.length-1)](image);
        // fadeIn(image);
        return image;
    }
}
