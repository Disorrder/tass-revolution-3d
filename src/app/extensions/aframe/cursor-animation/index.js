AFRAME.registerComponent('cursor-animation', {
    init() {
        this.cursorComponent = this.el.components.cursor;

        this.params = {
            thetaStart: 0,
            thetaLength: 360,
            scale: 1
        }

        this.el.addEventListener('mouseenter', this._mouseenterHandle = this.mouseenterHandle.bind(this));
        this.el.addEventListener('fusing', this._fusingHandle = this.fusingHandle.bind(this));
        this.el.addEventListener('click', this._clickHandle = this.clickHandle.bind(this));
        this.el.addEventListener('mouseleave', this._mouseleaveHandle = this.mouseleaveHandle.bind(this));
    },

    remove() {
        this.el.removeEventListener('mouseenter', this._mouseenterHandle);
        this.el.removeEventListener('fusing', this._fusingHandle);
        this.el.removeEventListener('click', this._clickHandle);
        this.el.removeEventListener('mouseleave', this._mouseleaveHandle);
    },

    applyParams() {
        this.el.setAttribute('geometry', 'thetaStart', this.params.thetaStart);
        this.el.setAttribute('geometry', 'thetaLength', this.params.thetaLength);
        this.el.object3D.scale.setScalar(this.params.scale);
    },

    mouseenterHandle() {
        if (this.activeAnimation) this.activeAnimation.pause();
        anime({
            targets: this.params,
            scale: 1.7,
            duration: 200,
            easing: 'easeInQuad',
            update: this.applyParams.bind(this),
        });
    },

    fusingHandle() {
        if (this.activeAnimation) this.activeAnimation.pause();
        this.activeAnimation = anime({
            targets: this.params,
            thetaLength: 0,
            duration: this.cursorComponent.data.fuseTimeout-100,
            easing: 'easeInQuad',
            update: this.applyParams.bind(this),
        });
    },

    clickHandle() {
        if (this.activeAnimation) this.activeAnimation.pause();
        this.activeAnimation = anime({
            targets: this.params,
            thetaLength: 360,
            thetaStart: -360,
            scale: 1,
            duration: 500,
            easing: 'easeInQuad',
            update: this.applyParams.bind(this),
            complete: () => {
                this.params.thetaStart = 0;
            }
        });
    },

    mouseleaveHandle() {
        if (this.activeAnimation) this.activeAnimation.pause();
        this.activeAnimation = anime({
            targets: this.params,
            thetaLength: 360,
            scale: 1,
            duration: 200,
            easing: 'easeInQuad',
            update: this.applyParams.bind(this),
        });
        // this.activeAnimation.play();
    },
});
