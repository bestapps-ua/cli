import RegistryModel from "./RegistryModel.js";

class HistoryModel {
    normalizeHistoryKey(key) {
        let m = key.match(/\:\:port$/i);
        if (m) {
            return 'port';
        }
        return key;
    }

    getHistoryConfig() {
        return RegistryModel.get('selectedKeys') || {};
    }

    storeHistoryConfig(key, value) {
        let config = this.getHistoryConfig();
        if (!config[key]) {
            config[key] = [];
        }
        config[key].push(value);
        RegistryModel.set('selectedKeys', config);
    }

    storeSelectedKeyValueHistory(key, value, defaultValue) {
        function storeYourServiceName(me, value, defaultValue) {
            let config = me.getHistoryConfig();
            if (config['YOURSERVICENAME']) return;

            let isVal = me.isValueWithYourService(defaultValue);
            if (isVal && value.indexOf(isVal) === 0) {
                me.storeHistoryConfig('YOURSERVICENAME', me.getValueWithoutYourService(value, isVal));
            }
        }

        key = this.normalizeHistoryKey(key);
        let config = this.getHistoryConfig();
        if (!config[key]) {
            this.storeHistoryConfig(key, value);
            storeYourServiceName(this, value, defaultValue);
            return;
        }
        const found = config[key].find((item) => {
            return item === value;
        });
        if (found) {
            return;
        }
        this.storeHistoryConfig(key, value);
        storeYourServiceName(this, value, defaultValue);
    }


    getValueWithoutYourService(value, part) {
        return value.replace(part, '');
    }

    isValueWithYourService(defaultValue) {
        if(typeof defaultValue !== 'string') return false;
        let m = defaultValue.match(/(.*)YOURSERVICENAME$/i);
        if (m && (m[1] || m[1] === '')) {
            return m[1];
        }
        return false;
    }

    clear() {
        let config = this.getHistoryConfig();
        if (config['YOURSERVICENAME']) {
            delete config['YOURSERVICENAME'];
            RegistryModel.set('selectedKeys', config);
        }
    }
}

export default new HistoryModel();
