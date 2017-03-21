export default class Train {
    constructor() {
        this.position = new THREE.Vector3();
        this.wagons = [];
        this.wagonParams = {
            width: 3,
            height: 1.2,
            depth: 1,
            distance: 0.5,
            get x() { return this.width + this.distance; }
        }
    }

    addWagons(n = 1) {
        var position;
        for (let i = 0; i < n; i++) {
            let lastWagon = _.last(this.wagons);
            if (lastWagon) {
                position = lastWagon.position.clone;
                position.x += this.wagonParams.width + this.wagonParams.distance;
            } else {
                position = new THREE.Vector3();
            }

            this.wagons.push({
                position
            });
        }
    }
}
