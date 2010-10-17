// http://nodejs.org/api.html#_child_processes
var sys = require('sys')
var exec = require('child_process').exec;

exports.ls = function(path, cb) {

    exec("ls", function puts(error, stdout, stderr) { 
        if (error !== null) {
            console.log('exec error: ' + error);
            // parse the stdout string
            cb.call(stdout.split (' '));
        } else {
            cb.call([]);
        }
    });

};