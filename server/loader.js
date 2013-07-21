/**
 * This module basically allows me to keep the require paths relative to the jsmapper directory.
 * We want to do this so that we can automatically convert those into variables when we build
 * the project for the browser.
 *
 * E.g:
 *  - require('./../../loader').load('/path/to/file')
 *
 * instead of:
 *  - require('./file')
 *
 * This allows us to convert:
 *  - require('./../../loader').load('/path/to/file')
 *
 * into:
 *  - JsMapper.Path.To.File
 *
 * which makes it easy to automatically build the project for use in the browser.
 *
 * @module Loader
 * @author Karl Purkhardt
 * @date 15/05/2013
 */
module.exports = (function() {

    var handlers = {};

    /**
     * @class Loader
     */
    return {
        /**
         * Loads a file using require()
         *
         * @method load
         * @param {string} path The path to the file
         * @returns {*} The loaded file
         */
        load: function(path) {
            if (handlers[path]!==undefined) {
                return handlers[path]();
            }
            return require('./' + path);
        },

        setHandler: function(path, handler) {
            handlers[path] = handler;
        },

        unsetHandler: function(path) {
            delete handlers[path];
        }
    };
})();