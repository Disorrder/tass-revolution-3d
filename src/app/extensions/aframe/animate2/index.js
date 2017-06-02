export default function animate(element, animations, animParams) {
    var $element = $(element);

    if (animParams) {
        animations = animations.map((v) => Object.assign({}, animParams, v));
    }

    animations.forEach((v, k) => {
        if (v.name == null) v.name = '';
        let name = `animation__${v.name}${k}`;
        let value = [];
        for (key in v) {
            value.push(`${key}: ${v[key]};`);
        }
        $element.attr(name, value.join(''));
    });
}

export function queue(element, animations, animParams) {

}
