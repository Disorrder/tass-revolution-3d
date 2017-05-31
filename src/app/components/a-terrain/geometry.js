// import AFRAME from 'aframe';
// var THREE = AFRAME.THREE;
var textureLoader = new THREE.TextureLoader();

AFRAME.registerGeometry('terrain', {
    // NOTE: height looks like depth param in a-box geometry
    schema: {
        width: { type: 'number', default: 1 }, // x
        height: { type: 'number', default: 1 }, // y
        segmentsWidth: { type: 'number', default: 1 },
        segmentsHeight: { type: 'number', default: 1 },
        bumpMap: { type: 'map' },
        bumpArray: { type: 'array' },
        bumpScale: { type: 'number', default: 1 }
    },

    init(data) {
        this.geometry = new THREE.PlaneGeometry( data.width, data.height, data.segmentsWidth, data.segmentsHeight );
        this.geometry.vertices.forEach((v) => {
            v.z = -v.y;
            v.y = 0;
        });

        // TODO: add bump map
    },
});
