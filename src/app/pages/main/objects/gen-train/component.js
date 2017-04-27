AFRAME.registerComponent('gen-train', {
    schema: {
        // wagons: { type: 'number', default: 10 },
        wagonSize: { type: 'vec3', default: '13 4 3' },
        wagonDistance: { type: 'number', default: 2 },
        wagonMap: { type: 'array', default: ['head', 'generic'] }
    },

    init() {
        this.train = $(this.el);
        this.generate();

        // centrify pivot
        // setTimeout(() => {
        //     var bb = new THREE.Box3().setFromObject(this.el.object3D);
        //     this.el.object3D.traverse((object) => {
        //         if (!object.geometry) return;
        //         console.log(object.geometry);
        //     });
        // });
    },

    generate() {
        this.data.wagonMap.forEach((name, i) => {
            this.genWagon(name).addClass(`wagon-${i}`).attr({
                position: [(this.data.wagonSize.x + this.data.wagonDistance) * i, 0, 0].join(' '),
            }).appendTo(this.el);
        });
    },

    genWagon(name) {
        if (!name || name === 'generic') {
            name = '';
        } else {
            name = '_' + name;
        }
        var html = require(`./template/wagon${name}.pug`)();
        return $(html);
    },
});
