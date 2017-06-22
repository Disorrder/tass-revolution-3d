import 'three/examples/js/exporters/OBJExporter.js';
import downloadFile from 'app/components/js/downloader'
import loadImage from 'app/components/js/loadImage';
import * as math from 'app/extensions/math';
import fadeIn from 'app/extensions/aframe/animate/fadeIn';
import zoomIn from 'app/extensions/aframe/animate/zoomIn';
import * as animate from 'app/extensions/anime';
import anime from 'animejs';
import './objects/gen-train';
window.anime = anime;

const FUSE_TIMEOUT = 1500;

var photoCtx = require.context("assets/photos", true, /\.(png|jpg)$/);
var photoNames = photoCtx.keys();

var _triggers = ['#trigger1', '#trigger2', '#trigger3'];
var currentTrigger = _triggers.shift();
class Trigger {
    constructor(options) {
        this.id = options.id;
        this.active = options.active;
        this.visible = options.visible;
        this.element = $(this.id)[0];
        // this.$element = $(this.id);
        // this.element = this.$element[0];

        ['_click', '_mouseenter', '_mouseleave'].forEach((event) => {
            this[event] = options[event];
            this.element.addEventListener(event, (e) => {
                // if (this.visible != true) return;
                if (this.id != currentTrigger) return;
                if (event == 'click') currentTrigger = _triggers.shift();

                if (!this.active) return;
                if (this[event]) this[event](e, this);
            });
        })
    }

    get active() { return this._active; }
    set active(v) { this._active = v; }

    get visible() { if (this.element) this.element.getAttribute('visible') }
    set visible(v) { if (this.element) this.element.setAttribute('visible', v) }
}

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

        folder = this.gui.addFolder('Camera');
        prop = folder.add(this.scene.camera, 'fov', 0, 120);
        prop.onChange(() => {
            this.scene.camera.updateProjectionMatrix();
        })
    }
    initGuiVR() { // not working idk why
        this.guivr = dat.GUIVR.create('Photos');
        this.guivr.add(this, 'addImage');
        $('#scene')[0].object3D.add(this.guivr);
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

        anime({
            targets: '#images a-image[opacity=0]',
            height: 0,
            visible: false,
            duration: 100,
        });

        setTimeout(() => {
            this.guiShow('#tip', '#tex-ui-tip-1');
        }, 5000);
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
            // height: 0.01 * size.y,
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
            begin() {
                var sound = $(`${selector} a-sound`)[0].components.sound;
                if (sound) sound.playSound();
            }
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
            id: '#trigger0',
            active: true,
            click() {
                location = location.href;
            },
        }),
        new Trigger({
            id: '#trigger1',
            active: true,
            click: this.runScene1.bind(this),
            mouseenter: (e, trigger) => {
                trigger.__fuseAnimation = animate.fadeIn('#trigger1 .img-1', {duration: FUSE_TIMEOUT});
                this.guiHide('#tip');
            },
            mouseleave: (e, trigger) => {
                trigger.__fuseAnimation.pause();
                trigger.__fuseAnimation = null;
                animate.hide('#trigger1 .img-1');
            },
        }),
        new Trigger({
            id: '#trigger2',
            active: true,
            click: this.runScene2.bind(this),
            mouseenter: (e, trigger) => {
                trigger.__fuseAnimation = animate.fadeIn('#trigger2 .img-1', {duration: FUSE_TIMEOUT});
            },
            mouseleave: (e, trigger) => {
                trigger.__fuseAnimation.pause();
                trigger.__fuseAnimation = null;
                animate.hide('#trigger2 .img-1');
            },
        }),
        new Trigger({
            id: '#trigger3',
            active: true,
            click: this.runScene3.bind(this),
            mouseenter: (e, trigger) => {
                trigger.__fuseAnimation = animate.fadeIn('#img11', {duration: FUSE_TIMEOUT});
            },
            mouseleave: (e, trigger) => {
                trigger.__fuseAnimation.pause();
                trigger.__fuseAnimation = null;
                animate.hide('#img11');
            },
        }),
    ]

    trainLightOff(selector) {
        var timeline = anime.timeline({autoplay: false});

        // Train windows fade to black
        var t2_windows = $(`${selector} .wagon__passanger`);
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
        var t2_head = $(`${selector} .wagon__head`)[0];
        var t2_light_mtl = [
            t2_head.object3D.findByName('Lamp_cone').material
        ];

        timeline.add({
            targets: t2_light_mtl,
            offset: '-=500',
            opacity: 0,
        });

        return timeline;
    }

    testTrainPath() {
        var points = ['#flag_t1', '#flag_t2']
    }

    runScene1(e, trigger) {
        trigger.active = false;

        var p1_open = this.openPortal('#portal1');

        anime({
            targets: '#bg_sound',
            volume: 0,
            duration: 3000,
            easing: 'linear',
            complete() {
                $('#bg_sound')[0].components.sound.stopSound();
            }
        });

        var timeline = anime.timeline();
        timeline
        .add({
            targets: {t:0}, t:0,
            delay: 1000,
            duration: p1_open.duration,
            begin() {
                p1_open.play();
                // $('#train3')[0].emit('run');
            },
            complete() {
                trigger.visible = false;
                $('#trigger1').remove();
            }
        })
        .add({
            targets: {t:0}, t:0,
            delay: this.debug ? 0 : 3000,
            begin: () => {
                this.closePortal('#portal1');
            }
        })

        // .add({
        //     targets: '#img1',
        //     opacity: 0,
        //     height: { value: 0, delay: 4000, duration: 10 },
        //     delay: 1000,
        //     duration: this.debug ? 100 : 3000,
        //     easing: 'easeInQuad',
        // })

        .add({ // rotate user
            targets: {t:0}, t:0,
            delay: 500,
            // offset: '-=2000',
            begin: () => {
                var targets = $('#playerBox, #group1 .platform');
                var rotation = _.map(targets, (v, k) => {
                    return v.getAttribute('rotation');
                });
                anime({
                    targets: rotation,
                    y: '-=90',
                    duration: 11000,
                    // elasticity: 0,
                    easing: 'linear',
                    run() {
                        rotation.forEach((v, i) => {
                            targets[i].setAttribute('rotation', `${v.x} ${v.y} ${v.z}`);
                            // targets[i].object3D.rotation.y = math.toRad(v.y);
                        });
                    }
                })
            }
        })

        .add({
            targets: {t:0}, t:0,
            delay: 500,
            duration: 500,
            begin: () => {
                $('#train1')[0].emit('run');
            }
        })
        .add({
            targets: '#img2',
            height: $('#img2').attr('height'),
            opacity: 1,
            delay: 2000,
            duration: 500,
            easing: 'easeInQuad',
            begin() {
                $('#img2 a-sound')[0].components.sound.playSound();
            }
        })

        .add({
            targets: '#img3',
            height: $('#img3').attr('height'),
            opacity: 1,
            delay: 2000,
            duration: 500,
            easing: 'easeInQuad',
            begin() {
                $('#img3 a-sound')[0].components.sound.playSound();
            }
        })
        .add({
            targets: '#img2',
            opacity: 0,
            height: { value: 0, delay: 1000, duration: 100 },
            delay: 1000,
            duration: 300,
            easing: 'easeInQuad',
        })
        .add({
            targets: '#img3',
            opacity: 0,
            height: { value: 0, delay: 2000, duration: 100 },
            delay: 2000,
            duration: 300,
            easing: 'easeInQuad',
        })

        .add({
            targets: '#img4',
            height: $('#img4').attr('height'),
            opacity: 1,
            delay: 2000,
            duration: 500,
            begin() {
                $('#img4 a-sound')[0].components.sound.playSound();
            }
        })
        .add({
            targets: '#img4',
            opacity: 0,
            height: { value: 0, delay: 4500, duration: 100 },
            delay: 4000,
            duration: 500,
            easing: 'easeInQuad',
            begin: () => {
                var trigger = _.find(this.triggers, {id: '#trigger2'});
                trigger.visible = true;
            },
            complete: () => {
                var trigger = _.find(this.triggers, {id: '#trigger2'});
                trigger.active = true;
            }
        })
    }

    runScene2(e, trigger) {
        trigger.active = false;

        var t1_off = this.trainLightOff('#train1');

        var timeline = anime.timeline();
        timeline
        .add({ // rotate user
            targets: {t:0}, t:0,
            delay: 500,
            // offset: '-=2000',
            begin: () => {
                var targets = $('#playerBox, #group1 .platform');
                var rotation = _.map(targets, (v, k) => {
                    return v.getAttribute('rotation');
                });
                anime({
                    targets: rotation,
                    y: '-=90',
                    duration: 11000,
                    // elasticity: 0,
                    easing: 'linear',
                    run() {
                        rotation.forEach((v, i) => {
                            targets[i].setAttribute('rotation', `${v.x} ${v.y} ${v.z}`);
                            // targets[i].object3D.rotation.y = math.toRad(v.y);
                        });
                    }
                })
            }
        })
        .add({
            targets: {t:0}, t:0,
            delay: 2000,
            // duration: $('#train1 [begin=run2]').attr('dur'),
            begin: () => {
                $('#train1')[0].emit('run2');

                var t1_sound = $('#train1')[0].components.sound;
                anime({
                    targets: t1_sound,
                    volume: 0,
                    delay: +$('#train1 [begin=run2]').attr('dur'),
                    duration: 5000,
                    complete() {
                        t1_sound.stopSound();
                    }
                })
            }
        })

        .add({
            targets: '#trigger2 .img-1',
            opacity: 0,
            easing: 'easeInQuad',
            complete() {
                trigger.visible = false;
            },
        })

        .add({
            targets: '#img5',
            visible: true,
            opacity: 1,
            delay: 2000,
            duration: 1000,
            easing: 'easeInQuad',
            begin() {
                $('#img5 a-sound')[0].components.sound.playSound();
            }
        })

        .add({
            targets: '#img6',
            visible: true,
            opacity: 1,
            delay: 2000,
            duration: 1000,
            easing: 'easeInQuad',
            begin() {
                $('#img6 a-sound')[0].components.sound.playSound();
            }
        })

        .add({
            targets: '#img7',
            visible: true,
            opacity: 1,
            delay: 1000,
            duration: 1000,
            easing: 'easeInQuad',
            begin() {
                $('#img7 a-sound')[0].components.sound.playSound();
            }
        })

        //.add({
            //targets: '#img5, #img6, #img7',
            //visible: true,
            //opacity: 1,
            //delay(el, i) { return i * 2500 },
            //duration: 500,
          //  easing: 'easeInQuad',
      //  })

        var img8 = $('#img8')[0];

        timeline
        .add({
            targets: '#img8',
            visible: true,
            opacity: 1,
            delay: 1000,
            duration: 1000,
            easing: 'easeInQuad',
            begin() {
                $('#img8 a-sound')[0].components.sound.playSound();
            }
        })
        // .add({
        //     targets: img8.object3D.position,
        //     y: 25,
        //     offset: '-=500',
        //     delay: 1000,
        //     duration: 600,
        //     easing: 'easeInOutQuart',
        //     complete() {
        //         $('#img3 a-sound')[0].components.sound.playSound();
        //     }
        // })

        .add({
            targets: '#img5, #img6, #img7, #img8',
            opacity: 0,
            delay: 5000,
            duration: 200,
            easing: 'easeInQuad',
            complete: () => {
                var trigger = _.find(this.triggers, {id: '#trigger3'});
                trigger.visible = true;
            }
        })

        .add({
            targets: {t:0}, t:0,
            // delay: $('#train1 [begin=ru2]').attr('dur'),
            duration: t2_off.duration,
            begin() {
                t2_off.play();
            }
        })

        .add({
            targets: '#img10',
            visible: true,
            opacity: 1,
            delay: 2000,
            duration: 500,
            easing: 'easeInQuad',
            complete() {
                $('#img10 a-sound')[0].components.sound.playSound();
            }
        })





        //----
        // .add({
        //     targets: {t:0}, t:0,
        //     delay: 1000,
        //     duration: 500,
        //     begin() {
        //         anime({
        //             targets: '#portal2 .animate',
        //             height: 0,
        //             opacity: 0,
        //             duration: 500,
        //         })
        //     }
        // })
        //
        // .add({
        //     targets: '#img5',
        //     height: $('#img5').attr('height'),
        //     opacity: 1,
        //     delay: 2000,
        //     duration: 1000,
        //     easing: 'easeInQuart',
        //     begin() {
        //         $('#img5 a-sound')[0].components.sound.playSound();
        //     }
        // })
        //
        // .add({
        //     targets: {t:0}, t:0,
        //     delay: 3000,
        //     duration: 500,
        //     begin: () => {
        //         $('#train3')[0].emit('run');
        //     }
        // })
        //
        // .add({
        //     targets: '#img6',
        //     height: $('#img6').attr('height'),
        //     opacity: 1,
        //     delay: 2000,
        //     duration: 500,
        //     begin() {
        //         $('#img6 a-sound')[0].components.sound.playSound();
        //     }
        //     // complete: () => {
        //     //     $('#group6 > a-entity').append(this.triggers[1].element);
        //     // }
        // })
        //

        // .add({
        //     targets: '#img5',
        //     opacity: 0,
        //     height: { value: 0, delay: 2000, duration: 100 },
        //     delay: 2000,
        //     duration: 500,
        //     // easing: 'easeInQuart',
        //     begin: () => {
        //         $('#img5 a-sound')[1].components.sound.playSound();
        //
        //         var trigger = _.find(this.triggers, {id: '#trigger2'});
        //         trigger.active = true;
        //     }
        // })
        // .add({
        //     targets: '#bg_sound',
        //     volume: 1,
        //     delay: 1000,
        //     duration: 2000,
        //     easing: 'linear',
        //     begin: () => {
        //         $('#bg_sound')[0].components.sound.playSound();
        //     }
        // })
    }

    runScene3(e, trigger) {
        trigger.active = false;

        // var p2_open = this.openPortal('#portal2');

        var timeline = anime.timeline();
        timeline
        .add({
            targets: '#img10, #img11',
            opacity: 0,
            delay: 1000,
            easing: 'easeInQuad',
            begin() {
                trigger.visible = false;
            },
        })

        // .add({
        //     targets: {t:0}, t:0,
        //     // delay: 1000,
        //     duration: p2_open.duration,
        //     begin: () => {
        //         console.log('werwer');
        //         p2_open.play();
        //     }
        // })
        .add({
            targets: '#img12',
            opacity: 1,
            delay: 1000,
        })

        .add({
            targets: '#img12',
            opacity: 0,
            delay: 1000,
            // easing: 'easeInQuad',
        })

        .add({
            targets: '#img13',
            opacity: 1,
            delay: 1000,
            // easing: 'easeInQuad',
            begin: () => {
                $('#train3')[0].emit('run');
            }
        })
        .add({
            targets: '#img13',
            color: '#fcc',
            delay: 2000,
            begin() {
                $('#img13 a-sound')[0].components.sound.playSound();
            }
            // easing: 'easeInQuad',
        })
        .add({
            targets: '#img14',
            opacity: 1,
            offset: '-=500',
            // easing: 'easeInQuad',
        })

        .add({
            targets: '#img13, #img14',
            opacity: 0,
            delay: 1000,
            complete() {
                $('#img14 a-sound')[0].components.sound.playSound();
            }
            // easing: 'easeInQuad',
        })

        .add({
            targets: '#group1 a-light',
            intensity: 0,
            // delay: 5000,
            duration: 2000,
            begin: () => {
                $('.sky_weather.particle-snow').remove();
                // var trigger = _.find(this.triggers, {id: '#trigger2'});
                // $('#group6 > a-entity').append(trigger.element);
            }
        })

        var img12 = $('#img12')[0];
        timeline
        .add({
            targets: '#img121',
            opacity: 1,
            delay: 2000,
            begin() {
                img12.setAttribute('src', '#tex-photo-5');
                img12.setAttribute('scale', '0 0 1');
                img12.setAttribute('opacity', 1);

                anime({
                    targets: img12.object3D.scale,
                    x: 1, y: 1,
                    duration: 3000,
                    easing: 'linear',
                })
              },
          complete() {
                    $('#trigger2 a-sound')[0].components.sound.playSound();
            }
        })

        .add({
            targets: '#img121',
            color: '#faa',
            duration: 2000,
            easing: 'linear',
        })
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
