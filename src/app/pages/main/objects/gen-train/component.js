AFRAME.registerComponent('gen-train', {
    schema: {
        wagons: { type: 'number', default: 10 },
        wagonSize: { type: 'vec3', default: '15 4 3' },
        wagonDistance: { type: 'number', default: 2 },
        // height: { type: 'number', default: 5 }, // wagon + wheels
    },

    init() {
        this.train = $(this.el);
        this.wheels = [];
        this.wheels[0] = [this.data.wagonSize.x/2 - 2, -this.data.wagonSize.y/2 - 0.5 , 0.8];
        this.wheels[1] = [this.wheels[0][0], this.wheels[0][1], -this.wheels[0][2]];
        this.wheels[2] = [-this.wheels[0][0], this.wheels[0][1], this.wheels[0][2]];
        this.wheels[3] = [-this.wheels[0][0], this.wheels[0][1], -this.wheels[0][2]];
        this.generate();
    },

    generate() {
        this.genHead().appendTo(this.el);

        for (let i=1; i < this.data.wagons; i++) {
            this.genWagon().attr({
                position: [(this.data.wagonSize.x + this.data.wagonDistance) * i, 0, 0].join(' '),
            }).appendTo(this.el);
        }
    },

    genWagon() {
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

    genHead() {
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
        ;
    },
});
