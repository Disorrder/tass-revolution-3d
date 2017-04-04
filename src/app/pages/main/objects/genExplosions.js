AFRAME.registerComponent('gen-explosions', {
    schema: {
        colorHMin: {type: 'color'},
        colorHMax: {type: 'color'},
        angleMin: {type: 'number'},
        angleMax: {type: 'number'},
        distanceMin: {type: 'number'},
        distanceMax: {type: 'number'},
        position: {type: 'vec3'},
    },

    init() {
        this.elem = $(this.el);
        var data = this.elem.data();
        if (data.colorRange)    [this.data.colorHMin,    this.data.colorHMax] = data.colorRange.split(',');
        if (data.angleRange)    [this.data.angleMin,    this.data.angleMax] = data.angleRange.split(',');
        if (data.distanceRange) [this.data.distanceMin, this.data.distanceMax] = data.distanceRange.split(',');
        console.log('expl', this, this.el, data, this.data);
    },
    remove() {
        this.pause();
    },

    play() {
        var i = 0;
        this.I = setInterval(() => {
            if (i++ > 10) return this.pause();
            let explosion = this.createExplosion();
            // explosion.appendTo(this.el);
        }, 500);
    },
    pause() {
        clearInterval(this.I);
    },

    update() {

    },

    getRotation() {
        return _.random(this.data.angleMin, this.data.angleMax, true);
    },
    getDistance() {
        return _.random(this.data.distanceMin, this.data.distanceMax, true);
    },
    getColor() {
        var h = _.random(this.data.colorHMin, this.data.colorHMax);
        return new THREE.Color(`hsl(${h}, 100%, 50%)`);
    },

    createExplosion() {
        var light = $('<a-light>').attr({
            position: [this.data.position.x, this.data.position.y, this.data.position.z].join(' '),
            type: 'spot',
            distance: this.getDistance(),
            decay: 1,
            intensity: 3,
            angle: 85,
            color: '#' + this.getColor().getHexString()
        });
        return $('<a-entity>').attr({
            class: 'light-pivot',
            rotation: [0, this.getRotation(), 0].join(' '),
        }).append(light).appendTo(this.el);
    }
});
