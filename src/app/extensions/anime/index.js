export var lastAnimation; //?

export function fadeIn(selector, options = {}) {
    return anime({
        targets: selector,
        opacity: 1,
        delay: options.delay || 0,
        duration: options.duration || 300,
        easing: 'easeInQuad',
        begin() {
            show(selector);
        }
    });
}

export function fadeOut(selector, options = {}) {
    return anime({
        targets: selector,
        opacity: 1,
        delay: options.delay || 0,
        duration: options.duration || 300,
        easing: 'easeInQuad',
        complete() {
            hide(selector);
        }
    });
}

export function show(selector) {
    $(selector).attr('visible', true);
}

export function hide(selector) {
    $(selector).attr({
        opacity: 0,
        visible: false
    });
}
