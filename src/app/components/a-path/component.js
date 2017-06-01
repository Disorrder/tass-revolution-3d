AFRAME.registerComponent('path', {
    schema: {
        points: { type: 'number', default: 50 }
    },

    init(data) {
        // this.curve = new THREE.CatmullRomCurve3([new THREE.Vector3(), new THREE.Vector3()]);
        this.curve = new THREE.CatmullRomCurve3();
        this.points = [];
    },

    update() {
        this.curve.points = _.map(this.el.children, (v) => v.object3D && v.object3D.position)
            .filter((v) => v instanceof THREE.Vector3)
        ;

        console.log(this.curve.points);

        if (this.curve.points.length < 2) return;
        this.points = this.curve.getPoints(this.data.points);
    }
});
