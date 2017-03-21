import loadImage from 'app/core/loadImage';
import fadeIn from 'app/core3d/aframe/animate/fadeIn';
import zoomIn from 'app/core3d/aframe/animate/zoomIn';

var photoCtx = require.context("assets/photos", true, /\.(png|jpg)$/);
var photoNames = photoCtx.keys();

export default class Controller {
    constructor() {
        this.photos = photoNames;
        this.photosElem = $('#photos');

        this.initGui();
        // setTimeout(() => this.onStart(), 1000);
        this.generateTrains();
    }

    initGui() {
        if (!window.dat) return;
        this.gui = new dat.GUI();
        this.gui.add(this, 'addImage');
    }
    initGuiVR() { // not working idk why
        this.guivr = dat.GUIVR.create('Photos');
        this.guivr.add(this, 'addImage');
        $('#scene')[0].object3D.add(this.guivr);
    }

    onStart() {
        var image = this.addImage(this.photos[0]);
    }

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

    generateTrains() {
        this.trains = [];
        // TODO: clean up #trains?
        var trainParams = {
            distance: 0.5,
            get dz() { return this.distance + wagonParams.width; }
        };
        var wagonParams = {
            width: 3,
            height: 1.2,
            depth: 1,
            distance: 0.3,
            get dx() { return this.width + this.distance; }
        };

        var position;
        for (let i = 0; i < 5; i++) {
            position = [_.random(-15,-5,true), 0.7, 0 + (i*trainParams.dz)];
            let train = $('<a-entity>').attr({
                id: `train-${i}`,
                className: 'train',
                position: position.join(' '),
            });

            this.trains.push(train[0]);

            for (let j = 0; j < _.random(8, 12); j++) {
                position = [0 + (j*wagonParams.dx), 0, 0];
                let wagon = $('<a-box>').attr({
                    className: 'wagon',
                    position: position.join(' '),
                    width: wagonParams.width,
                    height: wagonParams.height,
                    depth: wagonParams.depth,
                }).appendTo(train);
            }

            train.appendTo('#trains');
        }
    }
}
