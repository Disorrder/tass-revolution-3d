export function getRandomSpread(spread) { // number or vector
    if (_.isNumber(spread)) return getRandomSpreadFloat(spread);
    var vector = spread.clone ? spread.clone() : {};
    if ('x' in spread) vector.x = getRandomSpreadFloat(spread.x);
    if ('y' in spread) vector.y = getRandomSpreadFloat(spread.y);
    if ('z' in spread) vector.z = getRandomSpreadFloat(spread.z);
    if ('w' in spread) vector.w = getRandomSpreadFloat(spread.w);
    return vector;
}

export function getRandomSpreadInt(spread) {
    return _.random(-spread/2, spread/2);
}

export function getRandomSpreadFloat(spread) {
    return _.random(-spread/2, spread/2, true);
}
