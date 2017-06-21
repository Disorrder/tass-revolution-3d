AFRAME.registerComponent('line-geometry', {
    schema: {
        maxPoints: { default: 100 },
        points: { default: [
            new THREE.Vector3(-0.5, 0, 0),
            new THREE.Vector3(0.5, 0, 0)
        ] },
    },

    init() {
        // var mesh = this.el.getOrCreateObject3D('mesh', THREE.Line);
        this.geometry = new THREE.Geometry();
        this.el.setObject3D('mesh', new THREE.Line(this.geometry));
    },

    update() {
        if (!this.data.points) return;

        this.geometry.vertices = this.data.points;
        this.geometry.verticesNeedUpdate = true;
        this.geometry.computeBoundingSphere();
    },

    // BufferGeometry
    // init() {
    //     // var mesh = this.el.getOrCreateObject3D('mesh', THREE.Line);
    //     this.geometry = new THREE.BufferGeometry();
    //     this.geometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(this.data.maxPoints * 3), 3));
    //     this.el.setObject3D('mesh', new THREE.Line(this.geometry));
    // },
    //
    // update() {
    //     if (!this.data.points) return;
    //
    //     let attr = this.geometry.getAttribute('position');
    //     this.data.points.forEach((v, i) => {
    //         attr.array[i + 0 * 3] = v.x;
    //         attr.array[i + 1 * 3] = v.y;
    //         attr.array[i + 2 * 3] = v.z;
    //     });
    //     attr.needsUpdate = true;
    //     this.geometry.computeBoundingSphere();
    // },
});
