// import AFRAME from 'aframe';
var extendDeep = AFRAME.utils.extendDeep;
var meshMixin = AFRAME.primitives.getMeshMixin();

AFRAME.registerPrimitive('a-rect-light', {
    defaultComponents: {
        'rect-light': {},
    },
    mappings: {
        'width': 'rect-light.width',
        'height': 'rect-light.height',
    }
});
