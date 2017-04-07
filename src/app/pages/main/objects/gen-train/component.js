AFRAME.registerComponent('gen-train', {
    schema: {
        // wagons: { type: 'number', default: 10 },
        wagonSize: { type: 'vec3', default: '13 4 3' },
        wagonDistance: { type: 'number', default: 2 },
        wagonMap: { type: 'array', default: ['head', 'generic'] }
    },

    init() {
        this.train = $(this.el);
        this.wheels = [];
        this.wheels[0] = [this.data.wagonSize.x/2 - 2, -this.data.wagonSize.y/2 - 0.5 , 0.8];
        this.wheels[1] = [this.wheels[0][0], this.wheels[0][1], -this.wheels[0][2]];
        this.wheels[2] = [-this.wheels[0][0], this.wheels[0][1], this.wheels[0][2]];
        this.wheels[3] = [-this.wheels[0][0], this.wheels[0][1], -this.wheels[0][2]];

        this.wheels[4] = [this.wheels[0][0] - 2, this.wheels[0][1], this.wheels[0][2]];
        this.wheels[5] = [this.wheels[1][0] - 2, this.wheels[1][1], this.wheels[1][2]];
        this.wheels[6] = [this.wheels[2][0] + 2, this.wheels[2][1], this.wheels[2][2]];
        this.wheels[7] = [this.wheels[3][0] + 2, this.wheels[3][1], this.wheels[3][2]];
        this.generate();
    },

    // update(oldData) {
    //     var diff = AFRAME.utils.diff(oldData, this.data);
    //     if (diff.wagonMap) {
    //         this.wagonMap =
    //     }
    // },

    generate() {
        this.data.wagonMap.forEach((name, i) => {
            this.genWagon(name).addClass(`wagon-${i}`).attr({
                position: [(this.data.wagonSize.x + this.data.wagonDistance) * i, 0, 0].join(' '),
            }).appendTo(this.el);
        })


        // this.genWagon('head').appendTo(this.el);
        // for (let i=1; i < this.data.wagons; i++) {
        //     this.genWagon().addClass(`wagon-${i}`).attr({
        //         position: [(this.data.wagonSize.x + this.data.wagonDistance) * i, 0, 0].join(' '),
        //     }).appendTo(this.el);
        // }
    },

    genWagon(name = '') {
        if (!name || name === 'generic') {
            name = '';
        } else {
            name = '_' + name;
        }
        var html = require(`./template/wagon${name}.pug`)();
        console.log('genWagon', html);
        return $(html);
    },

    _genWagon() {
        var wagon = $('<a-entity class="wagon">')
            .append(
                $('<a-box>').attr({
                    width: this.data.wagonSize.x,
                    height: this.data.wagonSize.y,
                    depth: this.data.wagonSize.z,
                    color: '#333',
                    roughness: 1
                })
            )
        ;

        this.wheels.forEach((v, i) => {
            wagon.append(
                $('<a-cylinder>').attr({
                    class: `wheel-${i}`,
                    position: v.join(' '),
                    rotation: '90 0 0',
                    height: 0.1,
                    radius: 0.5,
                    color: '#333',
                    roughness: 1
                })
            );
        });
        return wagon;
    },

    _genHead() {
        var light = $('<a-sphere>').attr({
            class: 'head-light',
            position: [-this.data.wagonSize.x/2, 4, 0].join(' '),
            radius: 0.25,
            material: 'shader: flat; color: #ffa;',
        })
            .append(
                $('<a-light>').attr({
                    position: '-1 0 0',
                    type: 'point',
                    distance: 9
                })
            )
            // .append(
            //     $('<a-light>').attr({
            //         position: '-1 0 0',
            //         type: 'spot',
            //         distance: 6
            //     })
            // )
            .append(
                $('<a-cone>').attr({
                    position: '-13.5 -3.57 0',
                    rotation: '0 0 -75',
                    height: 28.18,
                    'radius-bottom': 2,
                    'radius-top': 0.2,
                    'segments-height': 1,
                    material: 'shader: flat; color: #ffa; opacity: 0.5',
                })
            )
        ;

        return this.genWagon().attr({class: 'wagon-head'})
            .append(
                $('<a-cylinder>').attr({
                    position: [-this.data.wagonSize.x/2 + 2, 3, 0].join(' '),
                    height: 2,
                    radius: 0.5,
                    color: '#333',
                    roughness: 1
                })
            )
            .append(light)
        ;
    },
});
