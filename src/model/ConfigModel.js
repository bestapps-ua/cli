import RegistryModel from "./RegistryModel.js";
import fs from 'fs';

class ConfigModel {

    makeLinearConfig(config, list, currentKey = undefined, level = 0) {
        let keys = Object.keys(config);
        if (keys.length === 0) {
            return;
        }
        if (!currentKey) {
            return this.makeLinearConfig(config, list, keys[0], level);
        }
        for (let i = 0; i < keys.length; i++) {
            let key = keys[i];
            let currentKeys = currentKey.split('::');
            let keyByLevel = currentKeys[level];
            if (key === keyByLevel) {
                let conf = config[key];
                if (Array.isArray(conf) || typeof conf !== 'object') {
                    list.push({
                        currentKey,
                        value: conf
                    });
                } else {
                    for (let k of Object.keys(conf)) {
                        this.makeLinearConfig(conf, list, `${currentKey}::${k}`, level + 1);
                    }
                }
                if (keys[i + 1]) {
                    return this.makeLinearConfig(config, list, keys[i + 1], level);
                }
            }
        }
    }

    getConfigByLevel(config, key) {
        let currentKeys = key.split("::");
        let nextKey = currentKeys[0];
        if (currentKeys.length > 1) {
            currentKeys.shift();
            let nextKeys = currentKeys.join("::");
            return this.getConfigByLevel(config[nextKey], nextKeys);
        }
        return config[nextKey];
    }

    getConfig() {
        let path = RegistryModel.get('path');
        let filename = `${path}/config/example.json`;
        RegistryModel.set('config::filename', filename);
        return JSON.parse(fs.readFileSync(filename, 'utf8'));
    }

    storeConfig(config, key, value) {
        let currentKeys = key.split("::");
        let nextKey = currentKeys[0];
        if (!config[nextKey]) {
            config[nextKey] = {};
        }
        if (currentKeys.length > 1) {
            currentKeys.shift();
            let nextKeys = currentKeys.join("::");
            return this.storeConfig(config[nextKey], nextKeys, value);
        }
        config[nextKey] = value;
        return config;
    }

    createConfig(config) {
        let path = RegistryModel.get('path');
        let filename = `${path}/config/local.json`;
        fs.writeFileSync(filename, JSON.stringify(config, null, 2), {encoding: 'utf8'});
        return filename;
    }

    clear() {

    }
}

export default new ConfigModel();
