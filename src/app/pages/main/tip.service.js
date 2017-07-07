import * as animate from 'app/extensions/anime';

export default class Service {
    constructor() {
        this.items = [];
        this.parentElem = '#tips';
        this.maxVisibleStack = 1;

        // this.currentAnimation = null;
        this.animationParams = {
            duration: 300,
            easing: 'easeInQuad',
        }
    }

    tick(time, dt) {
        this._time = time;

    }

    addItem(item) {
        this.removeItem();

        item.createdAt = this._time;
        if (!item.lifetime) item.lifetime = 3000;
        this.items.push(item);
        this.showItem(item);
    }

    removeItem(item) {
        if (!this.items.length) return;
        if (!item) item = this.items[0];
        _.remove(this.items, item);
        this.hideItem(item);
    }

    showItem(item) {
        item.animation = animate.fadeIn(item.element);
    }

    hideItem(item) {
        item.animation = animate.fadeOut(item.element);
        item.animation.finished.then(() => {
            // item.element.remove();
            console.log('tip remove', item);
        });
    }
}

AFRAME.registerSystem('tip', {
    init() {
        this.items = [];
        this.parent = '#tips';
    },

    tick(time, dt) {
        this._time = time;
    },

    create(src) {
        var elem = $('<a-image>').attr({
            class: `tip-${this.items.length}`,
            src,
            tip: '',
            width: 0.5,
            'image-init': '',
            npot: true,
            opacity: 0,
        }).appendTo(this.parent);
    },

    add(item) {
        this.items.push(item);
        item.createdAt = this._time;
    },

    remove(item) {
        if (!item) item = this.items[0];
        item.hide();
    },

    unregister(item) {
        _.remove(this.items, item);
    },
});

AFRAME.registerComponent('tip', {
    schema: {
        lifetime: { default: 3000 }
    },

    init() {
        this.system.add(this);
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
        console.log('show');
        animate.fadeIn(this.el, { duration: 500 });
    },

    hide() {
        this.removing = true;
        console.log('tip pre rem', Date.now());
        animate.fadeOut(this.el, { duration: 500 }).finished.then(() => {
            $(this.el).remove();
            console.log('tip remove', Date.now());
        });
    }
});
