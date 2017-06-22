AFRAME.registerComponent('trigger', {
    init() {
        // if (!this.el.id) this.el.id = this.genId();
        this.el.classList.add('interactive');
    },
    // play() {
    // },
    // pause() {
    // },
    // remove() {
    // },
    //
    // tick() {
    // },

    genId() {
        var triggers = document.querySelectorAll('[id^=trigger]');
        var triggerIds = _.map(triggers, (v) => v.id.replace('trigger', '') | 0);
        var max = _.max(triggerIds);
        return 'trigger' + (max + 1);
    }
});
