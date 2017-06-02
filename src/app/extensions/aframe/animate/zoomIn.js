import animate from './animate';

export default function zoomIn(element, options) {
    var name = "zoom-in";
    var defaultOptions = {
        direction: 'reverse',
        dur: 300
    };
    options = Object.assign({}, defaultOptions, options);

    var animations = [
        {
            attribute: 'scale',
            to: '0 0 0',
        }
    ];

    animate(element, name, animations, options);
}
