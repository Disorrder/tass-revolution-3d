AFRAME.registerSystem('follow-mouse', {
    // schema: {},

    init() {
        this.sceneElem = $(this.sceneEl);
        this.entityCounter = 0;
        this.mouse = {
            position: new THREE.Vector3(0, 0, 0.6),
            activeButtons: []
        }
    },

    play() {
        if (!this.entityCounter++) { // first entity added
            this.addEvents();
        };
    },
    pause() {
        if (!--this.entityCounter) { // last entity deleted
            this.removeEvents();
        };
    },
    remove() {
        this.pause();
    },

    getCameraPosition() {
        // this.sceneEl.object3D.updateMatrixWorld( true );
        // this.sceneEl.camera.parent.updateMatrixWorld( true );
        return this.sceneEl.camera.position.clone().setFromMatrixPosition(this.sceneEl.camera.matrixWorld);
    },

    addEvents() {
        if (this.onMouseMove) this.sceneElem.on('mousemove.followMouse', this.onMouseMove.bind(this));
        // -- w/o jQuery --
        // if (this.onMouseMove) this.sceneEl.addEventListener('mousemove', this.__onMouseMove)
    },
    removeEvents() {
        console.log('removeEvents');
        this.sceneElem.off('.followMouse');
        // -- w/o jQuery --
        // this.sceneEl.removeEventListener('mousemove', this.__onMouseMove);
    },

    onMouseMove(e) {
        // original reference here: https://jsfiddle.net/atwfxdpd/10/
        this.mouse.position.x = (e.offsetX / this.sceneEl.clientWidth) * 2 - 1;
        this.mouse.position.y = - (e.offsetY / this.sceneEl.clientHeight) * 2 + 1;

        var cameraPosition = this.getCameraPosition();
        console.log('m move', cameraPosition);
        var vector = this.mouse.position.clone();
        console.log('vector', vector);
        vector.unproject(this.sceneEl.camera);
        console.log('vec unproj', vector);
        var dir = vector.sub( cameraPosition )//.normalize();
        console.log('dir', dir);
        var distance = - cameraPosition.z / dir.z;
        console.log('distance', distance);
        var pos = cameraPosition.clone().add( dir.multiplyScalar( distance ) );
        console.log('pos', pos);

        // console.log('m move', this.mouse.position, cameraPosition, dir, distance, pos);
    }
});
