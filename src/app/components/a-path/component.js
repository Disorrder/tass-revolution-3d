const UPDATE_TIMEOUT = 1500;

AFRAME.registerComponent('path', {
    schema: {
        points: { type: 'number', default: 50 }
    },

    init(data) {
        this.curve = new THREE.CatmullRomCurve3();
        this.points = [];
    },

    update() {
        this.updateCurvePoints();
        if (this.curve.points.length < 2) return;
        this.points = this.curve.getPoints(this.data.points);

        let lineGeometry = this.el.components['line-geometry'];
        if (lineGeometry) {
            lineGeometry.data.points = this.points;
            lineGeometry.update();
        }
    },

    updateCurvePoints() {
        // this.curve.points.length = 0;
        // this.el.getChildEntities().forEach((v, i) => {
        //     this.curve.points[i] = v.object3D.position;
        // });

        this.curve.points = this.el.getChildEntities().map((v) => v.object3D.position);
    },

    tick(time) {
        if (!UPDATE_TIMEOUT) return;
        if (!this._lastUpdate) this._lastUpdate = time;
        if (time - this._lastUpdate >= UPDATE_TIMEOUT) {
            this.update();
            this._lastUpdate = time;
        }
    }
});
