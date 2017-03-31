// see http://jeromeetienne.github.io/threex.geometricglow/examples/geometricglowmesh.html
import GlowMaterial from 'app/shaders/glow/material';

AFRAME.registerComponent('light-glow', {
    // dependencies: ['geometry', 'material'],
    schema: {
        radius: { type: 'number', default: 5 },
        offset: { type: 'number', default: 0 },
        intensity: { type: 'number', default: 1 },
        power: { type: 'number', default: 3 },
        color: {type: 'color', default: null }
    },

    init() {
        this.geometry = new THREE.BufferGeometry();

        this.light = this.el.getObject3D('light');
        if (!this.data.color) {
            this.data.color = this.light.color;
        }
    },

    play() {
        this.material = new GlowMaterial(this.data.offset, this.data.intensity, this.data.power, this.data.color);
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.el.setObject3D(`glow`, this.mesh);
    },

    update(oldData) {
        var diff = AFRAME.utils.diff(oldData, this.data);

        if (diff.radius) {
            this.updateGeometry();
        }
    },

    getGeometry() {
        return new THREE.SphereGeometry(this.data.radius, 64, 64);
    },

    updateGeometry() {
        // if (!this.geometry) this.geometry = new THREE.BufferGeometry();
        this.geometry.fromGeometry(this.getGeometry());
    }






    // --- super ---
    // initMesh() {
    //     var geometry = this.el.components.geometry.geometry;
    //     var material = this.el.components.material.material;
    //
    //     this.mesh = new THREE.Mesh(geometry, material);
    //     this.el.setObject3D(`mesh`, this.mesh);
    // },
});
