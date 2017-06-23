const UPDATE_TIMEOUT = 1000;

AFRAME.registerComponent('move-by-path', {
    schema: {
        path: { type: 'string' },
        position: { type: 'number', default: 0 }
    },

    init() {
        setTimeout(this.update.bind(this), 1000);
    },

    update(oldData = {}) {
        if (!this.pathEl || oldData.path !== this.data.path) {
            this.pathEl = $(this.data.path)[0];
            this.path = null;
        }
        if (!this.path) {
            this.path = this.pathEl.components.path;
        }
        if (!this.path) return;

        if (oldData.position !== this.data.position) {
            this.el.object3D.position.copy(this.path.curve.getPoint(this.data.position));
            if (this.data.position < 0.99) {
                this.el.object3D.lookAt(this.path.curve.getPoint(this.data.position+0.01));
            }
        }
    },

    // tick(time) {
    //     if (!UPDATE_TIMEOUT || this.path) return;
    //     if (!this._lastUpdate) this._lastUpdate = time;
    //     if (time - this._lastUpdate >= UPDATE_TIMEOUT) {
    //         this.update();
    //         this._lastUpdate = time;
    //     }
    // },
});
