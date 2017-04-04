import ExplodeMaterial from './material/material.js';
import * as math from 'app/core3d/math';

AFRAME.registerComponent('particle-explosions', {
    dependencies: ['particle-system'],
    schema: {
        particleCount: { type: 'number', default: 10 },
        maxAge: { type: 'number', default: 5 },
        animationDuration: { type: 'number', default: 500 },
        positionSpread: { type: 'vec3' },
        size: { type: 'number', default: 1 },
        color: { type: 'color' },
    },

    init() {
        // this.particleSystem = this.el.getObject3D('particle-system');
        // this.geometry = this.particleSystem.geometry;

        this.geometry = new THREE.BufferGeometry();
        this.material = new ExplodeMaterial();

    },

    play() {
        // this.particleSystem.material = this.material;

        this.initParticles();

        // console.log(this, this.el, this.el.object3DMap);
        console.log(this.particleSystem, this.particleSystem.geometry, this.particleSystem.geometry.getAttribute('params'));
        window.temp1 = this.addParticle.bind(this);
    },

    stop() {

    },

    tick(t, dt) {
        // this.material.uniforms.runTime = t;
        // this.material.uniforms.deltaTime = dt;
        this.geometry.getAttribute('active').array.forEach((v, i) => {
            if (v === 0) return;

        });

    },

    update(oldData) {
        var diff = AFRAME.utils.diff(oldData, this.data);

        if (diff.color) this.data._color = new THREE.Color(diff.color);
    },

    initParticles() {
        this.particleSystem = new THREE.Points(this.geometry, this.material);
        this.geometry.addAttribute('active', new THREE.BufferAttribute( new Int8Array(this.data.particleCount * 1).fill(0), 1 ));
        this.geometry.addAttribute('age', new THREE.BufferAttribute( new Float32Array(this.data.particleCount * 3), 3 )); // [currentTime, startTime, endTime]
        this.geometry.addAttribute('position', new THREE.BufferAttribute( new Float32Array(this.data.particleCount * 3), 3 ));
        this.geometry.addAttribute('size', new THREE.BufferAttribute( new Float32Array(this.data.particleCount * 1), 1 ));
        this.geometry.addAttribute('color', new THREE.BufferAttribute( new Float32Array(this.data.particleCount * 3), 3 ));
        this.geometry.addAttribute('radius', new THREE.BufferAttribute( new Float32Array(this.data.particleCount * 1), 1 ));

        // this.el.removeObject3D('particle-system', this.particleSystem);
        this.el.setObject3D('particle-system', this.particleSystem);
    },

    addParticle() {
        var i = this.geometry.getAttribute('active').array.findIndex((v) => v === 0);
        if (i === -1) return; // particleCount reached

        let pos = math.getRandomSpread(this.data.positionSpread);
        pos = this.particleSystem.position.clone().add(pos);

        let attr;
        attr = this.geometry.getAttribute('position');
        attr.setX(i, pos.x); attr.setY(i, pos.y); attr.setZ(i, pos.z);

        attr = this.geometry.getAttribute('color');
        attr.setX(i, this.data.x); attr.setY(i, this.data.y); attr.setZ(i, this.data.z);


        console.log('free!', i, this.el.object3D, pos, attr);
    },

    setAttribute(name, i, value) {
        var attr = this.geometry.getAttribute(name);
        if (!_.isObject(value)) {
            attr.setX(i, value);
            return this;
        }

        if ('x' in value) attr.setX(i, value.x);
        if ('y' in value) attr.setY(i, value.y);
        if ('z' in value) attr.setZ(i, value.z);
        if ('w' in value) attr.setW(i, value.w);

        if ('r' in value) attr.setX(i, value.x);
        if ('g' in value) attr.setY(i, value.y);
        if ('b' in value) attr.setZ(i, value.z);
        if ('a' in value) attr.setW(i, value.w);

        return this;
    },

});
