export function toRad(grad) {
    return grad * Math.PI / 180;
}

export function toGrad(rad) {
    return rad * 180 / Math.PI;
}

export function getRandomSpread() {
    return Math.random() - 0.5;
}

// -- random with preloaded array --
export const RANDOM_LENGTH = 1e6;
var _rand = [], _randCursor;

export function getRandomSpread_p() {
    return ++_randCursor >= RANDOM_LENGTH ? _rand[_randCursor = 0] : _rand[_randCursor];
}

export function initRandom_p() {
    for (_randCursor = 0; _randCursor < RANDOM_LENGTH; _randCursor++) {
        _rand.push( Math.random() - 0.5 );
    }
}



// // -- lodash -- //?
// export function getRandomSpread(spread) { // number or vector
//     if (_.isNumber(spread)) return getRandomSpreadFloat(spread);
//     var vector = spread.clone ? spread.clone() : {};
//     if ('x' in spread) vector.x = getRandomSpreadFloat(spread.x);
//     if ('y' in spread) vector.y = getRandomSpreadFloat(spread.y);
//     if ('z' in spread) vector.z = getRandomSpreadFloat(spread.z);
//     if ('w' in spread) vector.w = getRandomSpreadFloat(spread.w);
//     return vector;
// }
//
// export function getRandomSpreadInt(spread) {
//     return _.random(-spread/2, spread/2);
// }
//
// export function getRandomSpreadFloat(spread) {
//     return _.random(-spread/2, spread/2, true);
// }
