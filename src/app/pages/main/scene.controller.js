import loadImage from 'app/core/loadImage';
import fadeIn from 'app/core3d/aframe/animate/fadeIn';
import zoomIn from 'app/core3d/aframe/animate/zoomIn';
import './objects/genExplosions.js';

var photoCtx = require.context("assets/photos", true, /\.(png|jpg)$/);
var photoNames = photoCtx.keys();

export default class Controller {
    constructor() {
        this.photos = photoNames;
        this.photosElem = $('#photos');

        setTimeout(() => this.initGui(), 500);
        // setTimeout(() => this.onStart(), 1000);
        // this.generateTrains();
        // this.initTriggers();
        this.initExplosions();
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

    initTriggers() {
        var elem;
        elem = $('#trigger1')[0];
        elem.addEventListener('click', (e) => {
            console.log('clicked');
            $('#light2')[0].emit('start');
            $('#light3')[0].emit('switch');
        })
    }

    initExplosions() {
        var segments = $('#backlight .explosions-segment').each((i, elem) => {
            // var data = $(elem).data();
            // console.log('expl', elem, data);
        })
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

    generateTrains() {
        this.trains = [];
        // TODO: clean up #trains?
        var trainParams = {
            distance: 100,
            get dz() { return this.distance + wagonParams.depth; }
        };
        var wagonParams = {
            width: 15,
            height: 3,
            depth: 2.7,
            distance: 1.5,
            get dx() { return this.width + this.distance; }
        };

        var position;
        for (let i = 0; i < 10; i++) {
            position = [_.random(-55,-5,true), 1, 0 + (i*trainParams.dz)];
            let train = $('<a-entity>').attr({
                id: `train-${i}`,
                className: 'train',
                position: position.join(' '),
            });

            this.trains.push(train[0]);

            var color = _.random(15).toString(16);
            color = color + color + color;
            color = [_.random(15).toString(16), _.random(15).toString(16), _.random(15).toString(16)].join('')

            for (let j = 0; j < _.random(3, 11); j++) {
                position = [0 + (j*wagonParams.dx), 0, 0];
                let wagon = $('<a-box>').attr({
                    className: 'wagon',
                    position: position.join(' '),
                    width: wagonParams.width,
                    height: wagonParams.height,
                    depth: wagonParams.depth,
                    color: "#" + color
                }).appendTo(train);
            }

            train.appendTo('#trains');
        }
    }
}
