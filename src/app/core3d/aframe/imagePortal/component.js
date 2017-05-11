// import AFRAME from 'aframe';
// var THREE = AFRAME.THREE;

AFRAME.registerComponent('image-portal', {
    schema: {
        color: { type: 'color', default: '#fff' },
        intensity: { type: 'number', default: 10 },
        width: { type: 'number', default: 1 },
        height: { type: 'number', default: 1 },
        distance: { type: 'number', default: 0 },
        angle: { type: 'number', default: 80 },
        penumbra: { type: 'number', default: 0 },
        decay: { type: 'number', default: 1 },
    },

    init() {
        this.light = new THREE.RectAreaLight(new THREE.Color(this.data.color), this.data.intensity, this.data.width, this.data.height);
        this.light.matrixAutoUpdate = true;
        // this.update();

        this.el.setObject3D('light', this.light);
        console.log('liii', this.light);
    },

    update() {
        let light = this.light;
        light.color     = new THREE.Color(this.data.color);
        light.intensity = this.data.intensity;
        light.width     = this.data.width;
        light.height    = this.data.height;
        light.distance  = this.data.distance;
        light.angle     = this.data.angle;
        light.penumbra  = this.data.penumbra;
        light.decay     = this.data.decay;
    },
});
