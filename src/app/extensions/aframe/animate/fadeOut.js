import animate from './animate';

export default function fadeOut(element, options) {
    var name = "fade-out";
    var defaultOptions = {
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
