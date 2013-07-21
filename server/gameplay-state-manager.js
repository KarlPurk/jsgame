/**
 * This modules contains the state manager object.
 * That object is responsible for managing the state of the gameplay.
 * @module GameplayStateManager
 */

/**
 * Constructor function for the GameplayStateManager type.
 * @method GameplayStateManager
 * @constructor
 */
var GameplayStateManager = function() {
    this.activeState = null;
    this.states = [];
    this.observers = [];
};

/**
 * Sets the states that this manager manages.
 * @method setStates
 * @param {Array} states
 */
GameplayStateManager.prototype.setStates = function(states, gameplay) {
    var self = this;
    this.states = states;
    this.states.forEach(function(state) {
        state.observe(self, self.handleStateEvent);
        state.gameplay = gameplay;
    });
};

/**
 * Called when an event occurs on a state object
 * @method notify
 * @param {String} event
 * @param {Object} data
 */
GameplayStateManager.prototype.handleStateEvent = function(event, data) {
    /**
     * If a state has become unlocked we should check all states again
     * because one state could be waiting for the locked state to unlock
     * before it could activate
     */
    if (event === 'unlocked') {
        this.check();
    }
};

/**
 * Check the states to see if the current state has changed
 * @returns {boolean}
 */
GameplayStateManager.prototype.check = function() {
    var self = this;
    var changedState = false;

    // Loop through each state we're managing
    this.states.forEach(function(state) {

        // If the state is already active we don't need to check it
        if (self.activeState === state) {
            return;
        }

        // If we've already changed state we don't want to change again so soon
        if (changedState) {
            return;
        }

        // If the conditions have been met to enter this state
        if (state.conditionsMet()) {

            // Enter the state
            state.enter();

            // Keep track of the current state
            self.activeState = state;

            // Notify the observers that the state has changed
            self.notifyObservers('state_changed', state);

            // Update the flag so that we can prevent changing state again during this check() call
            changedState = true;
        }
    });

    // Let the caller know if the state was changed
    return changedState;
};

/**
 * Adds a new observer to this state manager.
 * Observers will be notified of certain events.
 * @param {Object} observer
 */
GameplayStateManager.prototype.observe = function(observer, callback) {
    this.observers.push({observer: observer, callback: callback});
};

/**
 * Notifies the registered observers that a specified event has occurred.
 * @param {String} event
 * @param {Object} data
 */
GameplayStateManager.prototype.notifyObservers = function(event, data) {
    var originalArguments = arguments;
    this.observers.forEach(function(observer) {
        observer.callback.apply(observer.observer, originalArguments);
    })
};

module.exports = GameplayStateManager;