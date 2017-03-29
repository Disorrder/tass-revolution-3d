// import AFRAME from 'aframe';
// var THREE = AFRAME.THREE;

AFRAME.registerComponent('follow-mouse', {
    // schema: {},

    init() {
        console.log('follow-mouse init', this);
    },
    play() {
        this.system.play();
        console.log(this.el.getObject3D('mesh'));
    },
    pause() {
        this.system.pause();
    },
    remove() {
        this.system.remove();
    },

    tick() {

    }
});
