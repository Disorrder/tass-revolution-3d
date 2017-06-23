const g = 9.8;

export default class BallisticCurve extends THREE.Curve {
    constructor(position, velocity, mass = 1) {
        super();
        this.startPosition = position.clone();
        this.startVelocity = velocity.clone();
        this.mass = mass;
    }

    getPoint(t) {
        
    }
}
