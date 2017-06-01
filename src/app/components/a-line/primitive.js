// import AFRAME from 'aframe';
var extendDeep = AFRAME.utils.extendDeep;
var meshMixin = AFRAME.primitives.getMeshMixin();

AFRAME.registerPrimitive('a-line', extendDeep({}, meshMixin, {
    defaultComponents: {
        'line-geometry': {},
        material: {
            shader: 'line'
        },
    },
    mappings: {
        'width': 'material.width',
    }
}));
