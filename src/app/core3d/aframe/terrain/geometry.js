// import AFRAME from 'aframe';
// var THREE = AFRAME.THREE;
import loadImage from 'app/core/loadImage';

AFRAME.registerGeometry('terrain', {
    schema: {
        width: { // x
            type: 'number',
            default: 1
        },
        height: { // y
            type: 'number',
            default: 1
        },
        segmentsWidth: {
            type: 'number',
            default: 1
        },
        segmentsHeight: {
            type: 'number',
            default: 1
        },
        heightMap: {
            type: 'array',
            default: []
        }
    },

    init(data) {
        this.data = data;
        this.geometry = this.getGeometry();
    },

    getGeometry() {
        var geometry = new THREE.PlaneGeometry(
            this.data.width,
            this.data.height,
            this.data.segmentsWidth,
            this.data.segmentsHeight
        );

        if (this.data.heightMap) {
            let heights = this.data.heightMap;
            for (let i = 0, len = geometry.vertices.length; i < len; i++) {
                if (!heights[i] && heights[i] !== 0) break;
                geometry.vertices[i].z = heights[i];
            }
        }

        return geometry;
    },

    // update(oldData) {
    //     var diff = AFRAME.utils.diff(oldData, this.data);
    //
    //     this.setGeometry();
    // },
    //
    // getGeometry() {
    //     var plane = new THREE.PlaneGeometry(this.data.width, this.data.height, );
    //     return geometry;
    // },
    //
    // // --- super ---
    //
    // getBufferGeometry() {
    //     return (new THREE.BufferGeometry()).fromGeometry( this.getGeometry() );
    // }
    //
    // setGeometry(bufferGeometry, mesh) {
    //     if (!mesh) mesh = this.mesh;
    //     if (!bufferGeometry) bufferGeometry = this.getBufferGeometry();
    //     this.geometry = mesh.geometry = bufferGeometry;
    // },
    //
    // updateGeometry() {}
});
