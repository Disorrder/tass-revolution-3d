// import AFRAME from 'aframe';
// var THREE = AFRAME.THREE;

AFRAME.registerComponent('resolution', {
    schema: { type: 'v2', default: '0 0' },

    init() {
        console.log(this.el.object3D);
    },

    update() {

    },
});
