import 'three/examples/js/exporters/OBJExporter.js';
import downloadFile from 'app/components/downloader'
import loadImage from 'app/components/loadImage';
import fadeIn from 'app/core3d/aframe/animate/fadeIn';
import zoomIn from 'app/core3d/aframe/animate/zoomIn';
import animate from 'app/core3d/aframe/animate2';
import anime from 'animejs';
import './objects/gen-train';
window.anime = anime;

var photoCtx = require.context("assets/photos", true, /\.(png|jpg)$/);
var photoNames = photoCtx.keys();

//-
window.testtl = () => {
    var q = {q: 0};
    var t0 = Date.now();
    function get_dt() { return Date.now() - t0 }

    anime.timeline()
    .add({
        targets: q,
        q: 1,
        delay: 1000,
        begin() {
            console.log('tl begin', 0, get_dt(), q.q, this, this.currentTime, this.offset, this.delay);
        },
        run() {
            console.log('tl run', 0, get_dt(), q.q);
        },
        // update() {
        //     console.log('tl update', 0, get_dt(), q.q);
        // },
        complete() {
            console.log('tl complete', 0, get_dt(), q.q);
        }
    })
    .add({
        targets: q,
        q: 2,
        delay: 1000,
        begin() {
            console.log('tl begin', 1, get_dt(), q.q, this, this.currentTime, this.offset, this.delay);
        },
        run() {
            console.log('tl run', 1, get_dt(), q.q);
        },
        // update() {
        //     console.log('tl update', 1, get_dt(), q.q);
        // },
        complete() {
            console.log('tl complete', 1, get_dt(), q.q);
        }
    })
}

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
        this.scene = $('#scene')[0].object3D;
        this.photos = photoNames;
        this.photosElem = $('#photos');

        // setTimeout(() => this.initGui(), 500);
        setTimeout(() => this.onStart(), 3000);

        window.exportScene = this.exportScene.bind(this);
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
        // var image = this.addImage(this.photos[0]);
        // this.openPortal('#portal20');
    }

    openPortal(selector, timeline) {
        var portal_texture = $(`${selector} a-image`)[0].getObject3D('mesh').material.map;
        var size = $(selector).attr('size') || 'auto auto';
        var wh = portal_texture.image.width / portal_texture.image.height;

        {
            let [x, y] = size.split(' ');
            if (x !== 'auto') x = +x || portal_texture.image.width;
            if (y !== 'auto') y = +y || portal_texture.image.height;
            if (x === 'auto') x = (y * wh) || portal_texture.image.width;
            if (y === 'auto') y = (x / wh) || portal_texture.image.height;

            size = {x, y};
        }

        if (!timeline) timeline = anime.timeline({autoplay: false});

        return timeline
        .add({
            targets: `${selector} .animate`,
            width: size.x,
            height: 0.01 * size.y,
            duration: 200,
            // elasticity: 0,
            easing: 'easeInQuad',
        })
        .add({
            targets: `${selector} .animate`,
            // width: portal_texture.image.width,
            height: size.y,
            delay: 200,
            duration: 1500,
            elasticity: 0,
            easing: 'easeInQuad',
        })
        .add({
            targets: `${selector} a-image`,
            opacity: 1,
            delay: 500,
            duration: 500,
            easing: 'easeInQuad',
            elasticity: 100,
        })
    }

    closePortal(selector) {
        return anime({
            targets: `${selector} .animate`,
            height: 0,
            duration: 1000,
            // elasticity: 0,
            easing: 'easeInQuad',
        })
    }

    triggers = [
        new Trigger({
            id: '#trigger1',
            active: true,
            click: this.runTrain.bind(this),
        }),
    ]

    runTrain(e, trigger) {
        trigger.active = false;
        var _this = this;

        var p1_open = this.openPortal('#portal1');

        var timeline = anime.timeline();
        // this.openPortal('#portal1', timeline);
        timeline
        .add({
            targets: {t:0}, t:0,
            delay: 1000,
            duration: p1_open.duration,
            begin: () => {
                p1_open.play();
                // $('#train3')[0].emit('run');
            }
        })
        .add({
            targets: {t:0}, t:0,
            begin: () => {
                $('#train1')[0].emit('run');
                $('#train2')[0].emit('run');
            }
        })
        .add({
            targets: {t:0}, t:0,
            delay: 2000,
            duration: 1000,
            begin: () => {
                this.closePortal('#portal1');
            }
        })
        .add({
            targets: '#img2',
            opacity: 1,
            delay: 4000,
        })
        .add({
            targets: '#img3',
            opacity: 1,
            delay: 8000,
            duration: 300,
        })
        .add({
            targets: {t:0}, t:0,
            delay: 4000,
            begin: () => {
                this.openPortal('#portal2').play();
            }
        })
        .add({
            targets: '#img4',
            opacity: 1,
            delay: 2000,
            duration: 500,
        })
        .add({
            // delay: 4000,
            begin: () => {
                $('#train3')[0].emit('run');
            }
        })

        // Train windows fade to black
        var t2_windows = $('#train2 .wagon__passanger');
        var t2_windows_mtl = t2_windows.map((k, v) => v.object3D.findByName('Windows').material);
        t2_windows_mtl = _.uniq(t2_windows_mtl);

        var t2_windows_colors = t2_windows_mtl.map((v) => {
            return {color: '#'+v.color.getHexString()}
        });

        timeline.add({
            targets: t2_windows_colors,
            delay: 0,
            elasticity: 0,
            color: '#000',
            update() {
                t2_windows_mtl.forEach((v, k) => {
                    v.color.set(t2_windows_colors[k].color);
                })
            }
        });

        // Head light fade to transparent
        var t2_head = $('#train2 .wagon__head')[0];
        var t2_light_mtl = [
            t2_head.object3D.findByName('Lamp_cone').material
        ];

        timeline.add({
            targets: t2_light_mtl,
            offset: '-=500',
            opacity: 0,
        });
    }

    _runTrain(e, trigger) {
        trigger.active = false;

        // animate images
        // TODO: MAKE TIMELINE


        setTimeout(() => {
            this.openPortal('#portal1')
        }, 1000);

        anime({
            targets: '#img2',
            delay: 4000,
            opacity: 1
        });

        setTimeout(() => {
            this.openPortal('#portal20')
        }, 8000);

        anime({
            targets: '#img3',
            delay: 18000,
            duration: 300,
            opacity: 1
        });

        anime({
            targets: '#img4',
            delay: 20000,
            duration: 500,
            opacity: 1
        });

        $('#train1')[0].emit('run');
        $('#train2')[0].emit('run');
        $('#train3')[0].emit('run');

        // Train windows fade to black
        var t2_windows = $('#train2 .wagon__passanger');
        var t2_windows_mtl = t2_windows.map((k, v) => v.object3D.findByName('Windows').material);
        t2_windows_mtl = _.uniq(t2_windows_mtl);

        var t2_windows_colors = t2_windows_mtl.map((v) => {
            return {color: '#'+v.color.getHexString()}
        });

        anime({
            targets: t2_windows_colors,
            delay: 18000,
            elasticity: 100,
            color: '#000',
            update() {
                t2_windows_mtl.forEach((v, k) => {
                    v.color.set(t2_windows_colors[k].color);
                })
            }
        });

        // Head light fade to transparent
        var t2_head = $('#train2 .wagon__head')[0];
        var t2_light_mtl = [
            t2_head.object3D.findByName('Lamp_cone').material
        ];

        anime({
            targets: t2_light_mtl,
            delay: 18500,
            opacity: 0,
        });
    }

    runTrainAnime(e, trigger) {
        // trigger.active = false;
        Promise.resolve().then(() => {
            return anime({

            })
        })
    }

    // -- exporter --
    __exportScene() {
        // var data = $('#train1')[0].object3D.toJSON();
        // var data = $('#group1')[0].object3D.toJSON();
        var data = this.scene.toJSON();
        console.log('exp data', data);
        var json = JSON.stringify(data);
        console.log('exp json', json);

        downloadFile(data, 'scene.json');
    }

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
