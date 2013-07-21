App.ApplicationView = Ember.View.extend({
    elementId: ['container'],
    MapView: Ember.View.extend({
        templateName: 'map',
        classNames: ['map'],
        players: [],
        attacks: [],
        getLeft: function(left) {
            return $(this.get('element')).offset().left + left;
        },
        getTop: function(top) {
            return $(this.get('element')).offset().top + top;
        },
        AttackView: Ember.View.extend({
            templateName: 'attack',
            classNameBindings: [':attack', 'fadeOut:attack-fade-out'],
            attributeBindings: ['style'],
            attack: null,
            fadeOut: false,
            didInsertElement: function() {
                this.playFadeOutTransition();
            },
            colour: function() {
                if (this.get('attack').damage > 0) {
                    return 'red';
                }
                return 'blue';
            }.property('attack'),
            style: function() {
                var left = this.get('parentView').getLeft(this.get('attack.victim.position.x'));
                var top = this.get('parentView').getTop(this.get('attack.victim.position.y'));
                return "left: %@px; top: %@px".fmt(left, top);
            }.property('attack'),
            playFadeOutTransition: function() {
                var self = this;
                this.set('fadeOut', true);
                setTimeout(function() {
                    if (self.isDestroyed || self.isDestroying) {
                        return;
                    }
                    if (!self) {
                        return;
                    }
                    self.remove();
                }, 500);
            }
        }),
        PlayerView: Ember.View.extend({
            classNameBindings: [':player', 'attackAnimation:attack-animation'],
            templateName: 'player',
            attributeBindings: ['style'],
            player: null,
            /**
             * Determines whether to play the attack animation
             */
            attackAnimation: false,
            style: function() {
                var left = this.get('parentView').getLeft(this.get('player.position.x'));
                var top = this.get('parentView').getTop(this.get('player.position.y'));
                return "left: %@px; top: %@px".fmt(left, top);
            }.property('player.position'),
            HealthBarView: Ember.View.extend({
                tagName: 'span',
                template: Ember.Handlebars.compile(''),
                attributeBindings: ['style'],
                style: function() {
                    var health = this.get('player.health');
                    if (health < 0) {
                        health = 0;
                    }
                    return "width: %@%".fmt(health);
                }.property('player.health')
            }),
            willInsertElement: function() {

            },
            click: function() {
                var player = this.get('controller.controllers.player.content');
                // Players can't attack themselves
                if (player == this.get('player')) {
                    return;
                }
                this.set('controller.controllers.target.content', this.get('player'));
            },
            playAttackAnimation: function() {
                var self = this;
                this.set('attackAnimation', true);
                setTimeout(function() {
                    if (self.isDestroyed || self.isDestroying) {
                        return;
                    }
                    if (!self) {
                        return;
                    }
                    self.set('attackAnimation', false);
                }, 500);
            }
        })
    })
});