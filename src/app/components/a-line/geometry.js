AFRAME.registerComponent('line-geometry', {
    schema: {
        points: { default: [
            new THREE.Vector3(-0.5, 0, 0),
            new THREE.Vector3(0.5, 0, 0)
        ] },
        // watchPath: { default: false } // not implemented!
    },

    init() {
        // var mesh = this.el.getOrCreateObject3D('mesh', THREE.Line);
        this.geometry = new THREE.Geometry();
        this.el.setObject3D('mesh', new THREE.Line(this.geometry));
    },

    update() {
        if (this.el.components.path) {
            this.geometry.vertices = this.el.components.path.points;
            return;
        }
        if (!this.data.points) return;
        let points = this.data.points;
        if (typeof points === 'string') {
            // document.querySelector
            // TODO: link to defined a-path node
        }

        if (Array.isArray(points)) {
            this.geometry.vertices = points;
        }
    }
});
