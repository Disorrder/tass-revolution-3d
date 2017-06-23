AFRAME.registerComponent('common-material', {
    // schema: {},

    init() {

    },

    play() {
        this.material = this.el.getObject3D('mesh').material;
        this.el.object3D.traverse((elem) => {
            if (!elem.geometry) return;
            if (this.isStandartMaterial(elem.material)) {
                elem.material = this.material;
            }
        })
    },

    isStandartMaterial(material) {
        if (material.type !== "MeshStandardMaterial") return false;
        if (material.color.getHexString() !== "ffffff") return false;
        return true;
    }

});
