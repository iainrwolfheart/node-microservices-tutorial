module.exports = function(options) {
    var seneca = this;
    var plugin = 'restaurant';

    seneca.add({ role: plugin, cmd: 'get'}, get);
    seneca.add({ role: plugin, cmd: 'menu'}, menu);
    seneca.add({ role: plugin, cmd: 'item'}, item);
        
    function get(args, done) {
        if (args.id) {
            return done(null, getRestaurant(args.id));
        } else {
            return done(null, restaurants);
        }
    }

    function item(args, done) {
        var restaurantId = args.restaurantId;
        var itemId = args.itemId;

        var restaurant = getRestaurant(restaurantId)
        var desc = restaurant.menu.filter(function(obj, idx) {
            return obj.itemId == itemId
        })[0];

        var value = {
            item: desc,
            restaurant: restaurant
        };

        return done(null, value)
    }

    function menu(args, done) {
        var menu = getRestaurant(args.id).menu;
        return done(null, menu);
    }

    // If it doesn't work, change this to a regular nested function
    function getRestaurant(id) {
        return restaurants.filter((r, idx) => {
            return r.id === id;
        })[0]
    }

    return { name: plugin };
};