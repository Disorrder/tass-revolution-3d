import loadImage from 'app/core/loadImage';
import fadeIn from 'app/core3d/aframe/animate/fadeIn';
import zoomIn from 'app/core3d/aframe/animate/zoomIn';
import animate from 'app/core3d/aframe/animate2';
// import anime from 'animejs';
import './objects/gen-train';

var photoCtx = require.context("assets/photos", true, /\.(png|jpg)$/);
var photoNames = photoCtx.keys();

class Trigger {
    constructor(options) {
        this.id = options.id;
        this.active = options.active;
        this.click = options.click;

        this.element = $(this.id)[0];
        // this.$element = $(this.id);
        // this.element = this.$element[0];

        this.element.addEventListener('click', (e) => {
            if (!this.active) return;
            options.click(e, this);
        });
    }

    get active() { return this._active; }
    set active(v) {
        this._active = v;
    }
}

export default class Controller {
    constructor() {
        this.photos = photoNames;
        this.photosElem = $('#photos');

        setTimeout(() => this.initGui(), 500);
        // setTimeout(() => this.onStart(), 1000);
    }

    initGui() {
        if (!window.dat) return;
        var folder, prop, obj;
        this.gui = new dat.GUI();

        var lights = {
            ambient: $('.sky_light[type=ambient]')[0].getObject3D('light'),
            point: $('.sky_light[type=point]')[0].getObject3D('light'),
        }
        folder = this.gui.addFolder('Scene light');
        prop = folder.add(lights.ambient, 'intensity', 0, 1); $(prop.__li).find('.property-name').text('Ambient intensity');
        prop = folder.add(lights.point, 'intensity', 0, 1); $(prop.__li).find('.property-name').text('Point intensity');

        // folder = this.gui.addFolder('#l0');
        // obj = $('#l0')[0].getObject3D('light');
        // folder.add(obj, 'distance', 0, 200);

        // folder = this.gui.addFolder('#l1');
        // obj = $('#l1')[0].getObject3D('glow').material;
        // console.log(obj, obj.uniforms);
        // prop = folder.add(obj.uniforms.intensity, 'value', -10, 10); $(prop.__li).find('.property-name').text('intensity');
        // prop = folder.add(obj.uniforms.power, 'value', -10, 10); $(prop.__li).find('.property-name').text('power');
    }
    initGuiVR() { // not working idk why
        this.guivr = dat.GUIVR.create('Photos');
        this.guivr.add(this, 'addImage');
        $('#scene')[0].object3D.add(this.guivr);
    }

    onStart() {
        var image = this.addImage(this.photos[0]);
    }

    triggers = [
        new Trigger({
            id: '#trigger1',
            active: true,
            click: this.runTrain.bind(this),
        }),
    ]

    runTrain(e, trigger) {
        // trigger.active = false;
        var train = $('#train1')[0]
        train.emit('run');
        setTimeout(() => {
            // train.setAttribute('position', '100 0 0');
            $('#train2')[0].emit('run');
        }, 6500);
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
