var Collection = function() {};
Collection.prototype = Array.prototype;
Collection.prototype.findProperty = function(property, value) {
    var target = null;
    this.forEach(function(object) {
        if (target) {
            return;
        }
        if (object[property] === undefined) {
            return;
        }
        if (object[property] === value) {
            target = object;
        }
    });
    return target;
};
module.exports = Collection;