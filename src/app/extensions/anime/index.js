export function fadeIn(options) {
    return anime(Object.assign({
        opacity: 1,
        duration: 300,
        easing: 'easeInQuad',
        begin() {
            show(options.targets);
        }
    }, options));
}

export function fadeOut(options) {
    return anime(Object.assign({
        opacity: 0,
        delay: options.delay || 0,
        duration: options.duration || 300,
        easing: 'easeInQuad',
        complete() {
            hide(options.targets);
        }
    }, options));
}

export function show(targets) {
    $(targets).attr({visible: true});
}

export function hide(targets) {
    $(targets).attr({visible: false});
}
