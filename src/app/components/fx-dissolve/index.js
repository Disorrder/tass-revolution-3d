import Material from 'app/fx/dissolve';
var textureLoader = new THREE.TextureLoader();

AFRAME.registerComponent('fx-dissolve', {
    schema: {
        alphaMap: { type: 'map' },
        amount: { default: 0 }
    },

    init() {
        this.mesh = this.el.getObject3D('mesh');
        this.oldMaterial = this.mesh.material;
        this.material = new Material();
        this.mesh.material = this.material;
    },

    update(oldData) {
        var diff = AFRAME.utils.diff(oldData, this.data);
        if (diff.alphaMap) {
            let src = diff.alphaMap.src ? diff.alphaMap.src : diff.alphaMap;
            this.material.uniforms.alphaMap.value = textureLoader.load(src);
        }
        if (diff.amount) {
            this.material.uniforms.amount.value = diff.amount;
        }
    },

    tick() {
        if (this.oldMaterial.map && this.oldMaterial.map !== this.material.map) {
            this.material.map = this.oldMaterial.map;
        }
    },

    getAnimationParams() {
        return {
            targets: this.material.uniforms.amount,
            value: 1,
            duration: 500,
            easing: 'easeOutQuad'
        };
    },

    hide() {
        var params = this.getAnimationParams();
        params.value = 1;
        return anime(params);
    },
    show() {
        var params = this.getAnimationParams();
        params.value = 0;
        return anime(params);
    },
});
