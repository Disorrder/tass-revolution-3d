var trainParts;
function getTrainPart(name) {
    if (!trainParts) { // load model
        let json = require('./train-parts.json');

        // pre-mapping
        let jsonMap = {
            materials: [
                {
                    name: 'WindowMaterial',
                    type: 'MeshBasicMaterial',
                },
                {
                    name: 'Light',
                    type: 'MeshBasicMaterial',
                    opacity: 0.5
                },
            ]
        };

        jsonMap.materials.forEach((v) => {
            let mtl = json.materials.find((mtl) => mtl.name === v.name);
            if (!mtl) return;
            Object.assign(mtl, v);
            if (mtl.type === 'MeshBasicMaterial') {
                delete mtl.ambient;
                delete mtl.emissive;
                delete mtl.specular;
            }
        });
        // ---

        let loader = new THREE.ObjectLoader();
        let train = loader.parse(json);
        trainParts = train.children;

        trainParts.forEach((v) => {
            // mb remap names from Body.001 to Body?
            v.position.set(0, 0, 0);
            let body = v.children.find((v) => ~v.name.indexOf('Body')) || v;
            v.boxSize = new THREE.Box3().setFromObject(body).getSize();
        });
    }

    var part = trainParts.find((v) => v.name === name);
    var clone = part.clone();
    clone.boxSize = part.boxSize;
    return clone;
}

AFRAME.registerComponent('gen-train', {
    schema: {
        // wagons: { type: 'number', default: 10 },
        wagonDistance: { type: 'number', default: 0.2 },
        wagonMap: { type: 'array', default: ['head', 'generic'] }
    },

    init() {
        this.train = $(this.el);
        this.generate();

        // centrify pivot
        // setTimeout(() => {
        //     var bb = new THREE.Box3().setFromObject(this.el.object3D);
        //     this.el.object3D.traverse((object) => {
        //         if (!object.geometry) return;
        //         console.log(object.geometry);
        //     });
        // });
    },

    generate() {
        var trainLength = 0;
        this.data.wagonMap.forEach((name, i) => {
            var wagon = this.genWagon(name);
            // console.log(wagon, trainLength, wagon.boxSize.x);

            var dom = $('<a-entity>').addClass(`wagon-${i} wagon__${name}`).attr({
                position: [(trainLength + wagon.boxSize.x / 2), 0, 0].join(' '),
            }).appendTo(this.el);

            trainLength += wagon.boxSize.x;
            if (i > 0) trainLength += this.data.wagonDistance;

            dom[0].setObject3D('mesh', wagon);
            // console.log(dom[0].object3D);
        });
    },

    genWagon(name = 'wagon') {
        switch (name) {
            case '':
            case 'generic':
                name = 'wagon';
                break;

            case 'wagon':
            case 'head':
                break;

            default:
                name = 'wagon_' + name;
        }

        var obj = getTrainPart(name);
        return obj;
        // var html = require(`./template/wagon${name}.pug`)();
        // return $(html);
    },
});
