/**
 * Constructor function for the GameplayState type.
 * @param {String} name The string name of this state
 * @constructor
 */
var GameplayState = function(name) {
    this.name = name;
    this.startTime = null;
    this.locked = false;
    this.observers = [];
};

/**
 * Enters the current state.
 * @method enter
 */
GameplayState.prototype.enter = function() {
    console.log('Entering state: ' + this.name);
    this.startTime = new Date().getTime();
    this.enterState();
    this.notifyObservers('event_started', {state: this.name});
};

/**
 * Determines if the conditions have been met to enter this state.
 * @return {Boolean}
 */
GameplayState.prototype.conditionsMet = function() { return false; };

/**
 * Callback method which is triggered when this state is entered.
 */
GameplayState.prototype.enterState = function() {};

/**
 * Locks the current state for a specified number of seconds.
 * @param lockTime
 */
GameplayState.prototype.lock = function(lockTime) {
    var self = this;
    console.log('Locked state: ' + this.name + ' for ' + lockTime + ' seconds');
    this.locked = true;
    this.notifyObservers('locked');
    setTimeout(function() {
        console.log('Unlocked state: ' + self.name);
        self.locked = false;
        self.notifyObservers('unlocked');
    }, (lockTime * 1000));
};

/**
 * Adds a new observer to this state.
 * Observers will be notified of certain events.
 * @param {Object} observer
 */
GameplayState.prototype.observe = function(observer, callback) {
    this.observers.push({observer: observer, callback: callback});
};

/**
 * Notifies the registered observers that a specified event has occurred.
 * @param {String} event
 * @param {Object} data
 */
GameplayState.prototype.notifyObservers = function(event, data) {
    var originalArguments = arguments;
    this.observers.forEach(function(observer) {
        observer.callback.apply(observer.observer, originalArguments);
    })
};

module.exports = GameplayState;