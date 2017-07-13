AFRAME.registerComponent('fairy-controller', {
    init() {
        this.meshElem = $(this.el).find('.mesh')[0];
        this.particlesElem = $(this.el).find('.particles')[0];

        this.particlePosition = this.meshElem.object3D.position.clone();
    },

    tick(time, dt) {
        if (!this.particlePosition.equals(this.meshElem.object3D.position)) {
            this.particlePosition.copy(this.meshElem.object3D.position);
            this.particlesElem.setAttribute('gpu-particle-system', 'position', this.particlePosition);
        }
    },

    
});
