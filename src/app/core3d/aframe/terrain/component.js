// import AFRAME from 'aframe';
// var THREE = AFRAME.THREE;

AFRAME.registerComponent('terrain', {
    dependencies: ['geometry', 'material'],
    // schema: {},

    init() {
        this.initMesh();
    },

    // --- super ---
    initMesh() {
        var geometry = this.el.components.geometry.geometry;
        var material = this.el.components.material.material;

        this.mesh = new THREE.Mesh(geometry, material);
        this.el.setObject3D(`mesh`, this.mesh);
    },
});
