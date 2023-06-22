let models = new Map();

export default class RegistryModel {
    static set(key, value) {
        models.set(key, value);
    }

    static get(key){
        return models.get(key);
    }

    static keys(){
        return models.keys();
    }
}
