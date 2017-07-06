export default class Service {
    constructor() {
        this.items = [];
        this.maxVisibleStack = 1;

        this.defaultItem = {
            createdAt: 0,
            lifetime: 3000,
            parent: '#tips',
        };
    }

    tick(time, dt) {
        this.__time = time;
    }

    addItem(item) {
        this.items.push(item);
    }

    removeItem(item) {
        if (!item) item = this.items[0];
        _.remove(this.items, item);
    }
}
