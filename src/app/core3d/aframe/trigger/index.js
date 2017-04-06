AFRAME.registerComponent('trigger', {
    init() {
        if (!this.el.id) this.el.id = this.genId();
        this.el.classList.add('interactive');
    },
    play() {

    },
    pause() {
    },
    remove() {
    },

    tick() {

    },

    genId() {
        var triggers = document.querySelectorAll('[id^=trigger]');
        var triggerIds = _.map(triggers, (v) => v.id.replace('trigger', '') | 0);
        var max = _.max(triggerIds);
        return 'trigger' + (max + 1);
    }
});

AFRAME.registerPrimitive('a-trigger', {
    defaultComponents: {
        'position': '0 0 -5',
        'geometry': {
            primitive: 'sphere',
            radius: 5,
            thetaLength: 90,
        },
        'material': {
            visible: false,
            // wireframe: true,
        },
        'trigger': null,
        'particle-system': 'preset: snow; particleCount: 100; maxAge: 3; opacity: 0.9; type: 3; positionSpread: 20 0 20; size: 20; color: red,orange; velocityValue: 0 -3 0; velocitySpread: 2 2 0;'
    },
    mappings: {

    }
});
