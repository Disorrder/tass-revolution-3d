import 'three/examples/js/exporters/OBJExporter.js';
import downloadFile from 'app/components/js/downloader'
import loadImage from 'app/components/js/loadImage';
import * as math from 'app/extensions/math';
import fadeIn from 'app/extensions/aframe/animate/fadeIn';
import zoomIn from 'app/extensions/aframe/animate/zoomIn';
import * as animate from 'app/extensions/anime';
import './objects/gen-train';
import './message.service.js';
import './fairy.controller.js';

const FUSE_TIMEOUT = 1500;

var photoCtx = require.context("assets/photos", true, /\.(png|jpg)$/);
var photoNames = photoCtx.keys();

function __animeAttr(params) {
    var targets = $(params.targets).map((k, v) => v.getAttribute(params.attribute));
    params.targets = targets;
    var run = params.run;
    params.run = function(anim) {
        anim.animatables.forEach((v, k) => {
            v.setAttribute(params.attribute, targets[k]);
        });
        if (run) run.apply(this, attributes);
    }

    return params;
}

class Trigger {
    constructor(options) {
        this.id = options.id;
        this.element = $(this.id)[0];
        this.particlesElem = $(this.element).find('.particles')[0];
        this.mesh = this.element.getObject3D('mesh');
        console.log('TRIGG', this.id, this.mesh);
        // this.particlesElem = $(this.element).find('.particles')[0];
        if (options.active != null) this.active = options.active;
        if (options.visible != null) this.visible = options.visible;

        ['click', 'mouseenter', 'mouseleave'].forEach((event) => {
            this[event] = options[event];
            this.element.addEventListener(event, (e) => {
                // console.log(this.id, event, e, this.active, this._active, this.visible);
                if (!this.active) return;
                if (this[event]) this[event](e, this);
            });
        })
    }

    get active() { return this._active && this.visible; }
    set active(v) { this._active = v; }

    get visible() { return this.element ? this.element.getAttribute('visible') : false }
    set visible(v) {
        if (this.element) {
            this.element.setAttribute('visible', v);
            this.mesh.visible = v;
            this.spawnEnabled = v;
            console.log('vis', v, this.mesh, this.element);
        }
    }

    get spawnEnabled() { return this.particlesElem ? this.particlesElem.getAttribute('gpu-particle-system').spawnEnabled : null }
    set spawnEnabled(v) {
        if (this.particlesElem) {
            this.particlesElem.setAttribute('gpu-particle-system', 'spawnEnabled', v);
        }
    }

    hide() {
        // this.spawnEnabled = false;
        // setTimeout(() => { this.visible = false; }, 5000);
        return anime({
            targets: this,
            spawnEnabled: false,
            duration: 5000,
            complete: () => {
                this.visible = false;
            }
        })
    }

    show() {
        this.visible = true;
        this.spawnEnabled = true;
    }
 }

 class Collection {
     constructor(Item) {
         this.Item = Item;
     }

     items = []
     createId() {
         return `#${this.Item.name.toLowerCase()}${this.items.length}`;
     }
     create(options) {
         if (!options.id) options.id = this.createId();
         this.add(new this.Item(options));
         return this;
     }

     add(item) {
         this.items.push(item);
         return this;
     }

     get(id) {
         return this.items.find((v) => v.id === id);
     }

     delete(id) {
         // TODO
         return this;
     }
 }


export default class Controller {
    constructor() {
        // this.debug = true;
        this.scene = $('#scene')[0];
        this.messageService = this.scene.systems.message;

        this.triggers = new Collection(Trigger);

        if (this.scene.hasLoaded) {
            this.onStart();
        } else {
            this.scene.addEventListener('loaded', this.onStart.bind(this));
        }

        window.exportScene = this.exportScene.bind(this);
        window.ctrl = this;
    }

    onStart() {
        this.initGui();
        // $('.a-enter-vr-button').remove();

        if (AFRAME.utils.device.isGearVR()
            || AFRAME.utils.device.isMobile()
        ) {
            $('.a-enter-vr-button').click();
        }

        // Init triggers
        this.triggers.create({
            id: '#trigger0',
            active: true,
            click() {
                location = location.href;
            },
        });
        this.triggers.create({
            id: '#trigger1',
            active: true,
            click: this.runScene1.bind(this),
            mouseenter: (e, trigger) => {
                trigger.__fuseAnimation = animate.fadeIn('#trigger1 .img-1', {duration: FUSE_TIMEOUT});
                this.guiHide('#messages');
            },
            mouseleave: (e, trigger) => {
                trigger.__fuseAnimation.pause();
                trigger.__fuseAnimation = null;
                animate.hide('#trigger1 .img-1');
            },
        });
        this.triggers.create({
            id: '#trigger2',
            active: false,
            visible: false,
            click: this.runScene2.bind(this),
            mouseenter: (e, trigger) => {
                trigger.__fuseAnimation = animate.fadeIn('#trigger2 .img-1', {duration: FUSE_TIMEOUT});
            },
            mouseleave: (e, trigger) => {
                trigger.__fuseAnimation.pause();
                trigger.__fuseAnimation = null;
                animate.hide('#trigger2 .img-1');
            },
        });
        this.triggers.create({
            id: '#trigger3',
            active: false,
            visible: false,
            click: this.runScene3.bind(this),
            mouseenter: (e, trigger) => {
                trigger.__fuseAnimation = animate.fadeIn('#img11', {duration: FUSE_TIMEOUT});
            },
            mouseleave: (e, trigger) => {
                trigger.__fuseAnimation.pause();
                trigger.__fuseAnimation = null;
                animate.hide('#img11');
            },
        });

        setTimeout(() => {
            this.messageService.create('MSG_TIP_TRIGGER')
        }, 5000);
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


    playSound(options) {
        options = Object.assign({
            src: null,
            loop: true,
            volume: null,
            appendTo: '#sounds'
        }, options);
        var sound = $('<a-sound>').attr({
            autoplay: true,
            src: options.src,
            loop: options.loop,
            volume: options.volume
        });
        sound.appendTo(options.appendTo);
        return sound;
    }

    trainLightOff(selector) {
        var timeline = anime.timeline({autoplay: false});

        // Fade train windows to black
        var trainLightNames = ['Windows', 'Light_cone', 'Light_sphere'];
        var trainLightMtl = [];
        $(selector)[0].object3D.traverse((v) => {
            if (trainLightNames.includes(v.name)) {
                trainLightMtl.push(v.material);
            }
        })
        trainLightMtl = _.uniq(trainLightMtl);

        var trainLightColors = trainLightMtl.map((v) => {
            return {color: '#'+v.emissive.getHexString()}
        });

        timeline.add({
            targets: trainLightColors,
            delay: 0,
            elasticity: 0,
            color: '#000',
            update() {
                trainLightMtl.forEach((v, k) => {
                    v.emissive.set(trainLightColors[k].color);
                })
            }
        });

        // Head light fade to transparent
        var train_head = $(`${selector} .wagon__head`)[0];
        var train_light_mtl = [
            train_head.object3D.findByName('Lamp_cone').material
        ];

        timeline.add({
            targets: train_light_mtl,
            offset: '-=500',
            opacity: 0,
        });

        return timeline;
    }

    runRocket(selector) {
        var elem = $(selector);
        var flare = elem.find('.flare')[0];
        var smoke = elem.find('.smoke')[0];
        var particleComponent = smoke.components['gpu-particle-system'];
        var flareParams = {
            size: 10
        }
        var smokeParams = {
            t: 0,
            opacity: 1,
        };

        return anime.timeline()
        .add({
            targets: flare.object3D.position,
            y: 500,
            duration: 3000,
            easing: 'easeOutQuint',
            begin() {
                smoke.setAttribute('gpu-particle-system', 'spawnEnabled', true);
            },
            complete() {
                smoke.setAttribute('gpu-particle-system', 'spawnEnabled', false);
            }
        })
        .add({
            targets: flareParams,
            size: 500,
            duration: 200,
            easing: 'easeInOutQuad',
            run() {
                flare.setAttribute('width', flareParams.size);
                flare.setAttribute('height', flareParams.size);
            },
        })
        .add({
            targets: flare.object3D.position,
            y: 370,
            duration: 15000,
            easing: 'easeInOutQuad',
            run() {
                if (_.random(0, 10) === 0) {
                    let size = _.random(0.95, 1, true)
                    flare.setAttribute('opacity', size);
                    flare.setAttribute('width', flareParams.size * size);
                    flare.setAttribute('height', flareParams.size * size);
                }
            },
        })

        .add({
            targets: smokeParams,
            opacity: 0,
            duration: 300,
            easing: 'easeInOutQuint',
            run() {
                flare.setAttribute('opacity', smokeParams.opacity);
                flare.setAttribute('width', flareParams.size * smokeParams.opacity);
                flare.setAttribute('height', flareParams.size * smokeParams.opacity);
            },
        })

        .add({
            targets: smokeParams, t: 1,
            duration: 2500,
            offset: 0,
            easing: 'easeOutQuad',
            run() {
                smoke.setAttribute('gpu-particle-system', 'position', flare.object3D.position.toString())
                smoke.setAttribute('gpu-particle-system', 'opacity', 1 - smokeParams.t);
            },
        })
        .add({
            targets: {t: 0}, t: 0,
            duration: 25000,
            complete() {
                elem.attr({visible: false});
            },
        })
    }


    runScene1(e, trigger) {
        $('#layer1').attr({visible: true});
        trigger.active = false;

        var timeline = anime.timeline();
        timeline
        .add({
            targets: '#bg_music',
            volume: 0,
            duration: 3000,
            easing: 'linear',
            begin() {
                this.__volume = $('#bg_music')[0].getAttribute('sound').volume;
            },
            complete() {
                $('#bg_music')[0].components.sound.stopSound();
                $('#bg_music')[0].setAttribute('sound', 'volume', this.__volume);
            }
        })
        .add({ // basic fadeIn
            targets: '#img1-1',
            opacity: 1,
            offset: '-=3000',
            duration: 500,
            easing: 'easeInQuad',
            begin() {
                $('#img1-1').attr({visible: true});
            }
        })

        .add({
            targets: {t:0}, t:0,
            begin: () => {
                $('#train2').attr({visible: true})[0].emit('run');
            },
        })
        .add({
            targets: {t:0}, t:0,
            delay: 1000,
            begin: () => {
                this.runRocket('#rocket1');
            },
        })

        .add({ // basic fadeOut
            targets: '#img1-1',
            opacity: 0,
            duration: 500,
            easing: 'easeInQuad',
            complete() {
                $('#img1-1').attr({visible: false});
            }
        })

        .add({
            targets: {t:0}, t:0,
            // delay: 1000,
            duration: 700,
            begin: (anim) => {
                this.triggers.get('#trigger1').hide();
                var elem = $('#portal1')[0];
                elem.setAttribute('visible', true);
                elem.components['fx-dissolve'].show();
            },
        })
        .add({
            targets: '#fx-fire-1 .particles',
            visible: true,
            delay: 2000,
            begin(anim) {
                anim.animatables.forEach((v) => {
                    v.target.setAttribute('gpu-particle-system', {
                        size: 600,
                        opacity: 0.2
                    });
                });
            },
        })
        .add({
            targets: {t:0}, t:0,
            complete(anim) {
                $('#layer1-idle .trigger-group, #layer1 .trigger-group').attr({visible: false});
            }
        })
        .add({
            targets: {t:0}, t:0,
            // delay: 1000,
            duration: 1000,
            begin() {
                var elem = $('#portal1')[0];
                elem.components['fx-dissolve'].hide().finished.then(() => {
                    elem.setAttribute('visible', false);
                });
            },
        })

        // {
        //     // Rotation
        //     let elems = $('#playerBox, #layer0 .platform');
        //     let targets = _.map(elems, (v) => {
        //         return v.getAttribute('rotation');
        //     });
        //
        //     timeline.add({
        //         targets,
        //         y: '-=90',
        //         duration: 11000,
        //         easing: 'linear',
        //         run() {
        //             targets.forEach((v, k) => {
        //                 elems[k].setAttribute('rotation', v);
        //             });
        //         }
        //     });
        // }
        //
        // timeline

        .add({ // rotate user
            targets: {t:0}, t:0,
            delay: 500,
            begin: () => {
                var targets = $('#playerBox, #layer0 .platform');
                var rotation = _.map(targets, (v, k) => {
                    return v.getAttribute('rotation');
                });
                var sound = this.playSound({src: '#audio-platform', volume: 0.3});

                anime({
                    targets: rotation,
                    y: '-=90',
                    duration: 11000,
                    easing: 'linear',
                    run() {
                        rotation.forEach((v, i) => {
                            targets[i].setAttribute('rotation', v);
                        });
                    },
                    complete() {
                        sound.remove();
                    }
                })
            }
        })

        .add({
            targets: {t:0}, t: 0,
            delay: 500,
            duration: 500,
            begin(anim) {
                $('#train1').attr({visible: true})[0].emit('run');
            }
        })

        .add({
            targets: '#img1-2',
            opacity: 1,
            delay: 2000,
            duration: 500,
            easing: 'easeInQuad',
            begin() {
                $('#img1-2').attr({visible: true});
            }
        })

        .add({
            targets: '#img1-3',
            opacity: 1,
            delay: 1000,
            duration: 500,
            easing: 'easeInQuad',
            begin() {
                $('#img1-3').attr({visible: true});
            }
        })
        .add({
            targets: '#img1-4',
            opacity: 1,
            delay: 1000,
            duration: 500,
            easing: 'easeInQuad',
            begin() {
                $('#img1-4').attr({visible: true});
            }
        })
        .add({
            targets: '#img1-5',
            opacity: 1,
            delay: 1000,
            duration: 500,
            easing: 'easeInQuad',
            begin() {
                $('#img1-5').attr({visible: true});
            }
        })

        .add({
            targets: '#img1-2',
            opacity: 0,
            duration: 500,
            easing: 'easeInQuad',
            complete() {
                $('#img1-2').attr({visible: false});
            }
        })

        .add({
            targets: '#img1-3',
            opacity: 0,
            duration: 500,
            easing: 'easeInQuad',
            complete() {
                $('#img1-3').attr({visible: false});
            }
        })

        .add({
            targets: '#img1-4',
            opacity: 0,
            duration: 500,
            easing: 'easeInQuad',
            complete() {
                $('#img1-4').attr({visible: false});
            }
        })
        .add({
            targets: '#img1-5',
            opacity: 0,
            duration: 500,
            easing: 'easeInQuad',
            complete() {
                $('#img1-5').attr({visible: false});
            }
        })

        .add({
            targets: {t:0}, t: 0,
            delay: 4000,
            duration: 500,
            begin: (anim) => {
                $('#layer2-idle').attr({visible: true});
                anim.trigger = this.triggers.get('#trigger2');
                anim.trigger.show();
            },
            complete: (anim) => {
                anim.trigger.active = true;
            }
        })
        .add({
            targets: '#img2-1',
            opacity: 1,
            easing: 'easeInQuad',
            begin() {
                $('#img2-1').attr({visible: true});
            },
        })
    }


    runScene2(e, trigger) {
        trigger.active = false;
        $('#layer2').attr({visible: true});

        // var t1_off = this.trainLightOff('#train1');

        var timeline = anime.timeline();
        timeline
        .add({
            targets: {t:0}, t:0,
            delay: 1000,
            begin: () => {
                this.runRocket('#rocket2');
            },
        })
        .add({
            targets: '#img2-1',
            opacity: 0,
            easing: 'easeInQuad',
            begin() {
                trigger.hide();
            },
            complete() {
                $('#img2-1').attr({visible: false});
            },
        })
        .add({
            targets: {t:0}, t:0,
            delay: 2000,
            begin() {
                $('#fx-fire-2 .particles, #fx-fire-3 .particles').each((k, v) => {
                    v.setAttribute('gpu-particle-system', 'size', 400);
                    v.setAttribute('gpu-particle-system', 'opacity', 0.2);
                });
            },
        })

        .add({ // rotate user
            targets: {t:0}, t:0,
            delay: 500,
            begin: () => {
                var targets = $('#playerBox, #layer0 .platform');
                var rotation = _.map(targets, (v, k) => {
                    return v.getAttribute('rotation');
                });
                var sound = this.playSound({src: '#audio-platform', volume: 0.3});

                anime({
                    targets: rotation,
                    y: '-=90',
                    duration: 11000,
                    easing: 'linear',
                    run() {
                        rotation.forEach((v, i) => {
                            targets[i].setAttribute('rotation', v);
                        });
                    },
                    complete() {
                        sound.remove();
                    }
                })
            }
        })

        .add({
            targets: {t:0}, t:0,
            delay: 2000,
            // duration: $('#train1 [begin=run2]').attr('dur'),
            begin() {
                $('#train1')[0].emit('run2');
                $('#layer2-post .particle-snow')[0].setAttribute('gpu-particle-system', {spawnEnabled: true});

                // var t1_sound = $('#train1')[0].components.sound;
                // anime({
                //     targets: t1_sound,
                //     volume: 0,
                //     delay: +$('#train1 [begin=run2]').attr('dur'),
                //     duration: 5000,
                //     complete() {
                //         t1_sound.stopSound();
                //     }
                // })
            }
        })

        .add({
            targets: '#img2-2',
            opacity: 1,
            delay: 2000,
            duration: 1000,
            easing: 'easeInQuad',
            begin() {
                $('#img2-2').attr({visible: true});
                // $('#img2-2 a-sound')[0].components.sound.playSound();
            }
        })

        .add({
            targets: '#img2-3',
            opacity: 1,
            delay: 2000,
            duration: 1000,
            easing: 'easeInQuad',
            begin() {
                $('#img2-3').attr({visible: true});
                // $('#img2-3 a-sound')[0].components.sound.playSound();
            }
        })

        .add({
            targets: '#img2-4',
            visible: true,
            opacity: 1,
            delay: 1000,
            duration: 1000,
            easing: 'easeInQuad',
            begin() {
                $('#img2-4').attr({visible: true});
                // $('#img2-4 a-sound')[0].components.sound.playSound();
            }
        })

        .add({
            targets: '#img2-5',
            visible: true,
            opacity: 1,
            delay: 1000,
            duration: 1000,
            easing: 'easeInQuad',
            begin() {
                $('#img2-5').attr({visible: true});
                // $('#img2-5 a-sound')[0].components.sound.playSound();
            }
        })

        .add({
            targets: '#img2-2, #img2-3, #img2-4, #img2-5',
            opacity: 0,
            delay: 5000,
            duration: 200,
            easing: 'easeInQuad',
            complete: (anim) => {
                anim.trigger = this.triggers.get('#trigger3');
                anim.trigger.show();
                trigger.active = true;
            }
        })

        .add({
            targets: {t:0}, t: 0,
            delay: 4000,
            duration: 500,
            begin: (anim) => {
                $('#layer3-idle').attr({visible: true});
                anim.trigger = this.triggers.get('#trigger3');
                anim.trigger.show();
            },
            complete: (anim) => {
                anim.trigger.active = true;
            }
        })
        .add({
            targets: '#img3-1',
            opacity: 1,
            easing: 'easeInQuad',
            begin() {
                $('#img2-1').attr({visible: true});
            },
        })
    }


    runScene3(e, trigger) {
        trigger.active = false;
        $('#layer3').attr({visible: true});
        $('#layer2-post .particle-snow')[0].setAttribute('gpu-particle-system', {spawnEnabled: false});

        var timeline = anime.timeline();
        timeline
        .add({
            targets: '#img3-1',
            opacity: 0,
            delay: 2000,
            easing: 'easeInQuad',
            begin() {
                trigger.hide();
            },
            complete() {
                $('#img3-1').attr({visible: false});
            }
        })
        .add({
            targets: '#img3-2',
            opacity: 1,
            delay: 1000,
            easing: 'easeInQuad',
            begin() {
                $('#img3-2').attr({visible: true});
                // $('#img2-2 a-sound')[0].components.sound.playSound();
            }
        })
        .add({
            targets: '#img3-3',
            opacity: 1,
            delay: 1000,
            easing: 'easeInQuad',
            begin() {
                $('#img3-3').attr({visible: true});
                // $('#img2-2 a-sound')[0].components.sound.playSound();
            }
        })

        .add({
            targets: '#img3-2',
            opacity: 0,
            easing: 'easeInQuad',
            complete() {
                $('#img3-2').attr({visible: false});
            }
        })

        .add({
            targets: '#img3-4',
            opacity: 1,
            delay: 1000,
            easing: 'easeInQuad',
            begin() {
                $('#img3-4').attr({visible: true});
                // $('#img2-2 a-sound')[0].components.sound.playSound();
                $('#train3').attr({visible: true})[0].emit('run');
            }
        })

        .add({
            targets: '#img3-4',
            color: '#fcc',
            delay: 2000,
            begin() {
                // $('#img13 a-sound')[0].components.sound.playSound();
            }
        })
        .add({
            targets: '#img3-5',
            opacity: 1,
            offset: '-=500',
            begin() {
                $('img3-5').attr({visible: true});
            }
        })

        .add({
            targets: '#img3-5, #img3-5',
            opacity: 0,
            delay: 3000,
            complete() {
                $('#img3-3, #img3-4').attr({visible: false});
                // $('#img14 a-sound')[0].components.sound.playSound();
            }
        })

        .add({
            targets: '#img3-6',
            opacity: 1,
            begin() {
                $('img3-6').attr({visible: true});
            }
        })

        .add({
            targets: '#layer0 a-light',
            intensity: 0,
            duration: 2000,
            begin() {
                $('#layer1-post .particle-snow')[0].setAttribute('gpu-particle-system', {spawnEnabled: false});
            }
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
        var obj = $(selector)[0].object3D;
        var data = exporter.parse(obj);
        downloadFile(data, selector+'.obj');
    }
}
