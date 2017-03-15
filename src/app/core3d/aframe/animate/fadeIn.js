import animate from './animate';

export default function fadeIn(element, options) {
    var name = "fade-in";
    var defaultOptions = {
        direction: 'reverse',
        dur: 300
    };
    options = Object.assign({}, defaultOptions, options);

    var animations = [
        {
            attribute: 'material.opacity',
            to: 0,
        }
    ];

    animate(element, name, animations, options);
}
