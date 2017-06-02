import animate from './animate';

export default function zoomOut(element, options) {
    var name = "zoom-out";
    var defaultOptions = {
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
