var fs = require("fs"),
    command = require("./command.js");

exports.load = function(cb) {
    command.ls ('/var/node/yui3-gallery/build/', function(result) {
        var modules = ['a', 'b'];
        cb.call(modules);
    });
};