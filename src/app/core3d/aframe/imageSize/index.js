// import AFRAME from 'aframe';
// var THREE = AFRAME.THREE;

AFRAME.registerComponent('image-size', {
    schema: {
        width: { type: 'int', default: 0 },
        height: { type: 'int', default: 0 },
        dpu: { type: 'int', default: 300 },
    },

    // init() {},
    // play() {},

    update(oldData) {
        if (!this.image) return;

        // if (this.data.width || this.data.height) {
        //
        // }

        let wh = this.image.width / this.image.height;
        let size = {
            width: this.data.width,
            height: this.data.height,
        }
        if (!size.height) size.height = size.width / wh;
        if (!size.width) size.width = size.height * wh;

        this.el.setAttribute('width', size.width);
        this.el.setAttribute('height', size.height);
    },

    tick() {
        if (!this.image) { // check image load
            this.image = this.getTextureImage();
            if (this.image) this.update();
        }
    },

    getTextureImage() {
        var map = this.el.getObject3D('mesh').material.map;
        return map ? map.image : null;
    },
});
