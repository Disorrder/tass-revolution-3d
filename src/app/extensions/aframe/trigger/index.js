AFRAME.registerSystem('trigger', {
    schema: {},
    init() {
        this.items = [];
    },

    add(trigger) {

    },

    getById(id) {

    }
});

AFRAME.registerComponent('trigger', {
    init() {
        this.system = this.el.sceneEl.systems.trigger;
    },
});
