var WEAPON_PISTOL = 0;
var WEAPON_SHOTGUN = 1;

var Weapon = function(id, name, clipSize) {
    this.id = id;
    this.name = name;
    this.clipSize = clipSize;
    this.ammo = clipSize;
};
Weapon.prototype.damage = function() {
    return 0;
};
Weapon.prototype.fire = function() {
    if (this.ammo === 0) {
        return 0;
    }
    this.ammo--;
    return this.damage();
};
Weapon.prototype.randomNumber = function(from, to) {
    return Math.floor(Math.random() * ((to - from) + 1) + from);
}

var Pistol = function() {
    Weapon.call(this, WEAPON_PISTOL, 'pistol', 9);
};
Pistol.prototype = Object.create(Weapon.prototype);
Pistol.prototype.constructor = Weapon;
Pistol.prototype.damage = function() {
    return this.randomNumber(20,60);
};

var Shotgun = function() {
    Weapon.call(this, WEAPON_SHOTGUN, 'shotgun', 2);
};
Shotgun.prototype = Object.create(Weapon.prototype);
Shotgun.prototype.constructor = Weapon;
Shotgun.prototype.damage = function() {
    return this.randomNumber(50,100);
};

module.exports = {
    Pistol: Pistol,
    Shotgun: Shotgun
};