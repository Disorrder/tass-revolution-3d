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
            active: false,
            visible: false,
            click: this.runScene1.bind(this),
            // mouseenter: (e, trigger) => {
            //     trigger.__fuseAnimation = animate.fadeIn('#trigger1 .img-1', {duration: FUSE_TIMEOUT});
            //     this.guiHide('#messages');
            // },
            // mouseleave: (e, trigger) => {
            //     trigger.__fuseAnimation.pause();
            //     trigger.__fuseAnimation = null;
            // },
        });
        this.triggers.create({
            id: '#trigger2',
            active: false,
            visible: false,
            click: this.runScene2.bind(this),
            // mouseenter: (e, trigger) => {
            //     trigger.__fuseAnimation = animate.fadeIn('#trigger2 .img-1', {duration: FUSE_TIMEOUT});
            // },
            // mouseleave: (e, trigger) => {
            //     trigger.__fuseAnimation.pause();
            //     trigger.__fuseAnimation = null;
            //     animate.hide('#trigger2 .img-1');
            // },
        });
        this.triggers.create({
            id: '#trigger3',
            active: false,
            visible: false,
            click: this.runScene3.bind(this),
            // mouseenter: (e, trigger) => {
            //     trigger.__fuseAnimation = animate.fadeIn('#img11', {duration: FUSE_TIMEOUT});
            // },
            // mouseleave: (e, trigger) => {
            //     trigger.__fuseAnimation.pause();
            //     trigger.__fuseAnimation = null;
            //     animate.hide('#img11');
            // },
        });

        setTimeout(() => {
            var trigger = this.triggers.get('#trigger1');
            trigger.show();
            trigger.active = true;
        }, 3000);

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
        });
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
            return {
                color: '#'+v.color.getHexString(),
                emissive: '#'+v.emissive.getHexString()
            }
        });

        timeline.add({
            targets: trainLightColors,
            delay: 0,
            elasticity: 0,
            color: '#000',
            emissive: '#000',
            update() {
                trainLightMtl.forEach((v, k) => {
                    v.color.set(trainLightColors[k].color);
                    v.emissive.set(trainLightColors[k].emissive);
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
        trigger.active = false;
        trigger.hide();
        $('#layer1').attr({visible: true});
        $('#layer1-post .particle-snow')[0].setAttribute('gpu-particle-system', {spawnEnabled: true});

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

        .add({ // basic fadeOut
            targets: '#img1-1',
            opacity: 0,
            offset: '-=2000',
            duration: 500,
            easing: 'easeInQuad',
            complete() {
                $('#img1-1').attr({visible: false});
            }
        })

        .add({
            targets: {t:0}, t:0,
            // delay: 1000,
            duration: 1500,
            begin: (anim) => {
                var elem = $('#portal1')[0];
                var component = elem.getAttribute('fx-dissolve');
                anime({
                    targets: component,
                    amount: 0,
                    duration: 1500,
                    easing: 'easeInQuad',
                    run() {
                        elem.setAttribute('fx-dissolve', component);
                    },
                    begin() {
                        elem.setAttribute('visible', true)
                    },
                })
            },
        })

        .add({ // basic train run
            targets: {t:0}, t:0,
            begin() {
                let elem = $('#train2')[0];
                let component = elem.getAttribute('follow-path');
                anime({
                    targets: component,
                    position: [0, 1],
                    duration: 8000,
                    easing: 'linear',
                    run() {
                        component.position = +component.position;
                        elem.setAttribute('follow-path', component);
                    },
                    begin() {
                        elem.setAttribute('visible', true);
                    },
                    complete() {
                        elem.setAttribute('visible', false);
                    }
                })
            },
        })

        .add({
            targets: {t:0}, t:0,
            delay: 2200,
            begin() {
                var elem = $('#portal1')[0];
                var component = elem.getAttribute('fx-dissolve');
                anime({
                    targets: component,
                    amount: 1,
                    duration: 700,
                    easing: 'easeInQuad',
                    run() {
                        elem.setAttribute('fx-dissolve', component);
                    },
                    complete() {
                        elem.setAttribute('visible', false);
                    },
                })
            },
        })

        .add({ // basic fadeIn
            targets: '#img1-2',
            opacity: 1,
            delay: 800,
            duration: 500,
            easing: 'easeInQuad',
            begin() {
                $('#img1-2').attr({visible: true});
            }
        })

        .add({
            targets: {t:0}, t:0,
            delay: 2000,
            duration: 500,
            begin: () => {
                this.runRocket('#rocket1');
            },
        })

        .add({ // basic fadeOut
            targets: '#img1-2',
            opacity: 0,
            duration: 500,
            easing: 'easeInQuad',
            complete() {
                $('#img1-2').attr({visible: false});
            }
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
            delay: 500,
            begin() {
                let elem = $('#train1')[0];
                let component = elem.getAttribute('follow-path');
                anime({
                    targets: component,
                    position: [0, 0.6],
                    duration: 11000,
                    easing: 'linear',
                    run() {
                        component.position = +component.position;
                        elem.setAttribute('follow-path', component);
                    },
                    begin() {
                        elem.setAttribute('visible', true);
                    }
                })
            },
        })

        // .add({
        //     targets: '#img1-2',
        //     opacity: 1,
        //     delay: 2000,
        //     duration: 500,
        //     easing: 'easeInQuad',
        //     begin() {
        //         $('#img1-2').attr({visible: true});
        //     }
        // })

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
            delay: 2000,
            duration: 500,
            easing: 'easeInQuad',
            begin() {
                $('#img1-4').attr({visible: true});
            }
        })

        // .add({
        //     targets: '#img1-2',
        //     opacity: 0,
        //     duration: 500,
        //     easing: 'easeInQuad',
        //     complete() {
        //         $('#img1-2').attr({visible: false});
        //     }
        // })

        .add({
            targets: '#img1-5',
            opacity: 1,
            delay: 1000,
            duration: 500,
            easing: 'easeInQuad',
            begin() {
                $('#layer2-idle').attr({visible: true});
                $('#img1-5').attr({visible: true});
            }
        })

        .add({
            targets: '#img1-3',
            opacity: 0,
            delay: 1000,
            duration: 500,
            easing: 'easeInQuad',
            complete() {
                $('#img1-3').attr({visible: false});
            }
        })

        .add({
            targets: '#img1-4',
            opacity: 0,
            // delay: 1000,
            duration: 500,
            easing: 'easeInQuad',
            complete() {
                $('#img1-4').attr({visible: false});
            }
        })

        .add({
            targets: {t:0}, t: 0,
            delay: 6000,
            duration: 500,
            begin: (anim) => {
                anim.trigger = this.triggers.get('#trigger2');
                anim.trigger.show();
            },
            complete: (anim) => {
                anim.trigger.active = true;
            }
        })
    }


    runScene2(e, trigger) {
        trigger.active = false;
        trigger.hide();
        $('#layer2').attr({visible: true});

        var timeline = anime.timeline();
        timeline
        .add({
            targets: '#img1-5',
            opacity: 0,
            delay: 1000,
            duration: 500,
            easing: 'easeInQuad',
            complete() {
                $('#img1-5').attr({visible: false});
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
        .add({
            targets: {t:0}, t:0,
            delay: 1000,
            begin: () => {
                this.runRocket('#rocket2');
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
            begin() {
                $('#fx-fire-2 .particles, #fx-fire-3 .particles').each((k, v) => {
                    v.setAttribute('gpu-particle-system', {
                        size: 600,
                        opacity: 0.2,
                        lifetime: 20
                    });
                });
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

        .add({ // basic train run
            targets: {t:0}, t:0,
            delay: 2000,
            begin() {
                let elem = $('#train1')[0];
                let component = elem.getAttribute('follow-path');
                anime({
                    targets: component,
                    position: [0.6, 1],
                    duration: 8000,
                    easing: 'easeOutQuad',
                    run() {
                        component.position = +component.position;
                        elem.setAttribute('follow-path', component);
                    },
                })
            },
        })

        .add({
            targets: {t:0}, t:0,
            offset: '-=2000',
            duration: 2000,
            begin() {
                $('#layer1-post .particle-snow')[0].setAttribute('gpu-particle-system', {spawnEnabled: false});
            },
            complete() {
                $('#layer2-post .particle-snow')[0].setAttribute('gpu-particle-system', {spawnEnabled: true});
            }
        })

        //
        // .add({
        //     targets: {t:0}, t:0,
        //     delay: 2000,
        //     // duration: $('#train1 [begin=run2]').attr('dur'),
        //     begin() {
        //         $('#train1')[0].emit('run2');
        //         $('#layer2-post .particle-snow')[0].setAttribute('gpu-particle-system', {spawnEnabled: true});
        //
        //         // var t1_sound = $('#train1')[0].components.sound;
        //         // anime({
        //         //     targets: t1_sound,
        //         //     volume: 0,
        //         //     delay: +$('#train1 [begin=run2]').attr('dur'),
        //         //     duration: 5000,
        //         //     complete() {
        //         //         t1_sound.stopSound();
        //         //     }
        //         // })
        //     }
        // })

        .add({
            targets: '#img2-2',
            opacity: 1,
            // delay: 2000,
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
            // delay: 1000,
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
            // delay: 1000,
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
            delay: 3000,
            duration: 100,
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
            offset: '-=1500',
            duration: 1000,
            begin: () => {
                var t1_off = this.trainLightOff('#train1');
                t1_off.play();
            },
            complete() {
                $('#train1').attr({visible: false});
            }
        })

        .add({
            targets: '#img3-1',
            opacity: 1,
            easing: 'easeInQuad',
            begin() {
                $('#img3-1').attr({visible: true});
            },
        })
        .add({
            targets: {t:0}, t: 0,
            delay: 6000,
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
    }


    runScene3(e, trigger) {
        trigger.active = false;
        trigger.hide();
        $('#layer3').attr({visible: true});
        $('#layer2-post .particle-snow')[0].setAttribute('gpu-particle-system', {spawnEnabled: false});

        var timeline = anime.timeline();
        timeline
        .add({
            targets: '#img3-1',
            opacity: 0,
            delay: 2000,
            easing: 'easeInQuad',
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
            targets: '#img3-2',
            opacity: 0,
            delay: 2000,
            easing: 'easeInQuad',
            complete() {
                $('#img3-2').attr({visible: false});
            }
        })
        .add({
            targets: '#img3-3',
            opacity: 1,
            delay: 500,
            duration: 200,
            easing: 'easeInQuad',
            begin() {
                $('#img3-3').attr({visible: true});
                // $('#img2-2 a-sound')[0].components.sound.playSound();
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
            targets: '#img3-3',
            opacity: 0,
            delay: 2000,
            easing: 'easeInQuad',
            complete() {
                $('#img3-3').attr({visible: false});
                // $('#img2-2 a-sound')[0].components.sound.playSound();
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
            delay: 1000,
            offset: '-=500',
            begin() {
                $('#img3-5').attr({visible: true});
            }
        })

        .add({
            targets: '#img3-4, #img3-5',
            opacity: 0,
            delay: 3000,
            complete() {
                $('#img3-4, #img3-5').attr({visible: false});
                // $('#img14 a-sound')[0].components.sound.playSound();
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
        .add({
            targets: '#img3-6, #img3-9',
            opacity: 1,
            duration: 3000,
            easing: 'easeInQuad',
            begin() {
                $('#img3-6, #img3-9').attr({visible: true});
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
