// import AFRAME from 'aframe';
var extendDeep = AFRAME.utils.extendDeep;
var meshMixin = AFRAME.primitives.getMeshMixin();

AFRAME.registerPrimitive('a-terrain', extendDeep({}, meshMixin, {
    defaultComponents: {
        geometry: {primitive: 'terrain'},
        rotation: "-90 0 0",
        terrain: {}
    },
    mappings: {
        'width': 'geometry.width',
        'height': 'geometry.height',
        'segments-width': 'geometry.segmentsWidth',
        'segments-height': 'geometry.segmentsHeight',
        'height-map': 'geometry.heightMap',
        'height-map-src': 'geometry.heightMapSrc',
    }
}));
