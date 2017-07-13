import * as animate from 'app/extensions/anime';

var messages = [
    { id: 'MSG_TIP_TRIGGER', src: '#tex-ui-tip-1' }
];

AFRAME.registerSystem('message', {
    init() {
        this.items = [];
        this.parent = '#messages';
    },

    tick(time, dt) {
        this._time = time;
    },

    create(id) {
        var src = messages.find((v) => v.id === id).src;
        var elem = $('<a-image>').attr({
            class: `message-${this.items.length}`,
            src,
            message: '',
            width: 0.5,
            'image-init': '',
            npot: true,
            opacity: 0,
        }).appendTo(this.parent);
    },

    remove(item) {
        if (!item) item = this.items[0];
        item.hide();
    },

    register(item) {
        this.items.push(item);
        item.createdAt = this._time;
    },

    unregister(item) {
        _.remove(this.items, item);
    },
});

AFRAME.registerComponent('message', {
    schema: {
        // delay: { default: 0 }, // not implemented
        lifetime: { default: 3000 }
    },

    init() {
        this.system.register(this);
        this.show();
    },

    remove() {
        this.system.unregister(this);
    },

    tick(time) {
        if (this.data.lifetime && !this.removing
            && time >= this.createdAt + this.data.lifetime
        ) {
            this.hide();
        }
    },

    show() {
        animate.fadeIn(this.el, { duration: 500 });
    },

    hide() {
        this.removing = true;
        animate.fadeOut(this.el, { duration: 500 }).finished.then(() => {
            $(this.el).remove();
            console.log('message remove', Date.now());
        });
    }
});
