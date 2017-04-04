// import AFRAME from 'aframe';
var extendDeep = AFRAME.utils.extendDeep;
var meshMixin = AFRAME.primitives.getMeshMixin();

AFRAME.registerPrimitive('gen-train', {
    defaultComponents: {
        'gen-train': {},

    },
    mappings: {
        'width': 'geometry.width',
        'height': 'geometry.height',
        'segments-width': 'geometry.segmentsWidth',
        'segments-height': 'geometry.segmentsHeight',
        'height-map': 'geometry.heightMap',
        'height-map-src': 'geometry.heightMapSrc',
    }
});
