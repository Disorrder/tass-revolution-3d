import {mapMaterialData} from '../utils';

AFRAME.registerShader('line', {
    schema: {
        color: { type: 'color' },
        width: { type: 'number', default: 1 } // WARN: Always 1 on Windows.
    },

    init(data) {
        this.data = data;

        this.material = new THREE.LineBasicMaterial();
        this.update(data);  // `update()` currently not called after `init`. (#1834)
    },

    update(data) {
        // var diff = AFRAME.utils.diff(this.data, data);
        this.data = data;
        mapMaterialData(data, this.schema);

        if (data.__needsUpdate) this.material.needsUpdate = true;
        this.material.color = data.color;
        this.material.linewidth = data.width
    },
});
