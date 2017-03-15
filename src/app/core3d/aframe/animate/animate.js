export default function animate(element, name, animations, options) {
    $(element).find(`[name=${name}]`).remove();

    for (let anim of animations) {
        $('<a-animation>').attr({
            name: name,
            begin: options.autostart ? null : name,
            attribute: anim.attribute,
            from: anim.from,
            to: anim.to,
            direction: anim.direction || options.direction,
            dur: anim.dur || options.dur,
            delay: anim.delay || options.delay,
            easing: anim.easing || options.easing,
            repeat: anim.repeat || options.repeat
        }).appendTo(element);
    }
}
