export function mapMaterialData(data, schema) {
    for (let k in data) {
        let type = schema[k];
        if (!type) continue;
        let v = data[k];
        type = type.type;

        if (type === 'color' && v && !(v instanceof THREE.Color)) {
            v = new THREE.Color(v);
        }

        if (type === 'map' && v && !(v instanceof THREE.Texture)) {
            v = textureLoader.load(v);
            data.__needsUpdate = true;
        }

        data[k] = v;
    }
}
