AFRAME.registerComponent('image-init', {
    schema: {
        dpu: { type: 'int', default: 300 }, // Dots Per Unit. mb declare or find in systems?
    },

    init() {
        this.width = this.el.getAttribute('width');
        this.height = this.el.getAttribute('height');
    },

    update(oldData) {
        if (!this.image) return;

        if (!this.width && !this.height) {
            this.el.setAttribute('width', this.image.width / this.data.dpu);
            this.el.setAttribute('height', this.image.height / this.data.dpu);
            return;
        }

        let wh = this.image.width / this.image.height;
        if (!this.height) {
            this.el.setAttribute('height', this.width / wh);
        }
        if (!this.width) {
            this.el.setAttribute('width', this.height * wh);
        }
    },

    tick() {
        let image = this.getTextureImage();

        if (image !== this.image) { // check image load
            this.image = image;
            if (this.image) this.update();
        }
    },

    getTextureImage() {
        var map = this.el.getObject3D('mesh').material.map;
        return map ? map.image : null;
    },
});
