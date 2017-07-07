export function fadeIn(targets, options = {}) {
    return anime({
        targets,
        opacity: 1,
        delay: options.delay || 0,
        duration: options.duration || 300,
        easing: 'easeInQuad',
        begin() {
            show(targets);
        }
    });
}

export function fadeOut(targets, options = {}) {
    return anime({
        targets,
        opacity: 0,
        delay: options.delay || 0,
        duration: options.duration || 300,
        easing: 'easeInQuad',
        complete() {
            hide(targets);
        }
    });
}

export function show(targets) {
    $(targets).attr('visible', true);
}

export function hide(targets) {
    $(targets).attr({
        opacity: 0,
        visible: false
    });
}
