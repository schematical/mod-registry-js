const _ = require('underscore');

class RegistryCollection{
    constructor(namespace, registryManager){
        this.registryManager = registryManager;
        this.namespace = namespace;
        this.coll = {};
        this.rndKeys = null;
        this.rndMax = -1;

    }
    add(namespace, data){
        if(this.coll[namespace]){
            throw new Error("There is already an entry for: " + namespace);
        }
        if(!_.isObject(data)){
            throw new Error("Invalid `data` passed in. Must be an object")
        }
        let namespaceParts = namespace.split(":");
        data.shortNamespace = namespaceParts[namespaceParts.length - 1];
        this.coll[namespace] = data;
        this.rndKeys = null;
    }
    list(){
        return _.clone(this.coll);
    }
    get(namespace){
        if(!this.coll[namespace]){
            throw new Error("There is NOT entry for: " + namespace);
        }
        return _.clone(this.coll[namespace]);
    }
    rnd(){
        if(!this.rndKeys){
            this.rndKeys = [];
            let keys = Object.keys(this.coll);
            let index = 0;
            keys.forEach((key)=>{
                let data = this.coll[key];
                if(_.isUndefined(data._RND)){
                    data._RND = 1;
                }
                index += data._RND;
                this.rndKeys.push({
                    index: index,
                    key: key
                })
            })
            this.rndKeys = _.sortBy(this.rndKeys, (x)=>{
                return x.index;
            })
            this.rndMax = index;
        }

        let index = Math.floor(this.registryManager.rnd() * this.rndMax);

        let lastX = null;
        let winnerX = null;
        this.rndKeys.forEach((x)=>{


            if(
                (
                    !lastX ||
                    index >= lastX.index
                ) &&
                index < x.index
            ){
                winnerX = x;
            }
            lastX = x;

        })
        return this.coll[winnerX.key];



    }
}
class RegistryManager{
    constructor(options){
        options = options || {};
        this.rnd = options.rnd || Math.random;
        this.registries = {};
    }
    add(registryNamespace){
        let registeryCollection = new RegistryCollection(registryNamespace, this);

        this.registries[registeryCollection.namespace] = registeryCollection;
        Object.defineProperty(this, registeryCollection.namespace, {
            get: function() {
                return registeryCollection;
            }
        });
        return registeryCollection;
    }

    range(data, field, _default){

        if(_.isUndefined(data[field])){
            return _default;
        }
        let range = data[field].max - data[field].min;
        return Math.round(this.rnd() * range) + data[field].min;
    }
    rndColl(data, field, _default){
        if(_.isUndefined(data[field])){
            return _default;
        }
        if(!_.isArray(data[field])){
            throw new Error("`" + field +"` is not an array");
        }

        let index = Math.floor(this.rnd() * data[field].length);
        return data[field][index];
    }
}
module.exports = RegistryManager;

