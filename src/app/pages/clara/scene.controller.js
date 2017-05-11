import sceneJson from './scene.json';
// import trainPartsJSON from './train-parts.json';
import anime from 'animejs';

export default class Controller {
    constructor() {
        this.scene = $('#scene')[0].object3D;

        // load scene
        var loader = new THREE.ObjectLoader();
        var scene = loader.parse(sceneJson);
        this.scene.add(scene);

        // setTimeout(() => this.initGui(), 1000);
        // setTimeout(() => this.onStart(), 1000);
    }

    initGui() {
        if (!window.dat) return;
        var folder, prop, obj;
        this.gui = new dat.GUI();

        var lights = {
            ambient: $('.sky_light[type=ambient]')[0].getObject3D('light'),
            point: $('.sky_light[type=point]')[0].getObject3D('light'),
        }
        folder = this.gui.addFolder('Scene light');
        prop = folder.add(lights.ambient, 'intensity', 0, 1); $(prop.__li).find('.property-name').text('Ambient intensity');
        prop = folder.add(lights.point, 'intensity', 0, 1); $(prop.__li).find('.property-name').text('Point intensity');

        // folder = this.gui.addFolder('#l0');
        // obj = $('#l0')[0].getObject3D('light');
        // folder.add(obj, 'distance', 0, 200);

        // folder = this.gui.addFolder('#l1');
        // obj = $('#l1')[0].getObject3D('glow').material;
        // console.log(obj, obj.uniforms);
        // prop = folder.add(obj.uniforms.intensity, 'value', -10, 10); $(prop.__li).find('.property-name').text('intensity');
        // prop = folder.add(obj.uniforms.power, 'value', -10, 10); $(prop.__li).find('.property-name').text('power');
    }
    initGuiVR() { // not working idk why
        this.guivr = dat.GUIVR.create('Photos');
        this.guivr.add(this, 'addImage');
        $('#scene')[0].object3D.add(this.guivr);
    }

    onStart() {
        let obj = this.scene.getObjectByName( "Sinon___Sword_Art_Online" );
        obj.scale.multiplyScalar(1.5);
        // console.log(obj);
    }
}
